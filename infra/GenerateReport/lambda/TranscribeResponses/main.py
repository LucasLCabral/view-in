import json
import os
import boto3
import time

s3 = boto3.client("s3")
transcribe = boto3.client("transcribe")
sns = boto3.client("sns")

BUCKET_NAME = os.environ["BUCKET_NAME"]
SNS_TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN")

def transcribe_single_audio(session_id, job_report_id, question_index):
    """
    Transcreve um único áudio.
    """
    audio_key = f"responses-audios/{session_id}/resposta_{question_index}.mp3"
    
    # Verifica se o áudio existe
    try:
        s3.head_object(Bucket=BUCKET_NAME, Key=audio_key)
    except:
        print(f"❌ Áudio não encontrado: {audio_key}")
        return {
            "statusCode": 404,
            "body": json.dumps({"error": "Audio not found"})
        }
    
    # Cria job de transcrição
    job_name = f"transcribe-{session_id}-{question_index}-{int(time.time())}"
    audio_uri = f"s3://{BUCKET_NAME}/{audio_key}"
    
    print(f"🚀 Iniciando job: {job_name}")
    
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={"MediaFileUri": audio_uri},
        MediaFormat="mp3",
        LanguageCode="pt-BR"
    )
    
    # Aguarda conclusão (timeout de 5 minutos)
    max_wait = 300
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        job_status = status["TranscriptionJob"]["TranscriptionJobStatus"]
        
        if job_status == "COMPLETED":
            print(f"✅ Transcrição {question_index} concluída")
            
            # Pega o resultado
            transcript_uri = status["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
            import urllib.request
            with urllib.request.urlopen(transcript_uri) as response:
                transcript_data = json.loads(response.read().decode())
            
            transcription_text = transcript_data["results"]["transcripts"][0]["transcript"]
            
            # Salva no S3
            output_key = f"responses-text/{session_id}/transcription_{question_index}.json"
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=output_key,
                Body=json.dumps({
                    "question_index": question_index,
                    "transcription": transcription_text,
                    "job_name": job_name
                }, ensure_ascii=False),
                ContentType="application/json"
            )
            
            print(f"💾 Salvo em: {output_key}")
            
            # Deleta o job do Transcribe
            transcribe.delete_transcription_job(TranscriptionJobName=job_name)
            
            # Re-aciona ProcessUploadQueue para verificar se todos estão prontos
            sqs = boto3.client("sqs")
            UPLOAD_QUEUE_URL = os.environ.get("UPLOAD_QUEUE_URL")
            
            if UPLOAD_QUEUE_URL:
                try:
                    sqs.send_message(
                        QueueUrl=UPLOAD_QUEUE_URL,
                        MessageBody=json.dumps({
                            "session_id": session_id,
                            "job_report_id": job_report_id,
                            "num_questions": 5  # TODO: pegar do metadata
                        })
                    )
                    print(f"📨 Mensagem enviada para SQS para verificar consolidação")
                except Exception as e:
                    print(f"⚠️ Erro ao enviar mensagem SQS: {e}")
            
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "message": "Transcription completed",
                    "question_index": question_index,
                    "transcription": transcription_text
                })
            }
        
        elif job_status == "FAILED":
            error = status["TranscriptionJob"].get("FailureReason", "Unknown")
            print(f"❌ Transcrição falhou: {error}")
            return {
                "statusCode": 500,
                "body": json.dumps({"error": error})
            }
        
        time.sleep(5)
    
    print(f"⏰ Timeout aguardando transcrição")
    return {
        "statusCode": 504,
        "body": json.dumps({"error": "Transcription timeout"})
    }

def consolidate_transcriptions(session_id, job_report_id, num_questions):
    """
    Consolida todas as transcrições individuais em um único arquivo.
    """
    prefix = f"responses-text/{session_id}/"
    
    # Lista todas as transcrições
    response = s3.list_objects_v2(
        Bucket=BUCKET_NAME,
        Prefix=prefix
    )
    
    transcriptions = []
    if "Contents" in response:
        for obj in response["Contents"]:
            key = obj["Key"]
            if "transcription_" in key and key.endswith(".json"):
                # Lê a transcrição
                file_obj = s3.get_object(Bucket=BUCKET_NAME, Key=key)
                data = json.loads(file_obj["Body"].read().decode())
                transcriptions.append(data)
    
    # Ordena por question_index
    transcriptions.sort(key=lambda x: x.get("question_index", 0))
    
    print(f"📦 Consolidando {len(transcriptions)} transcrições")
    
    # Salva arquivo consolidado
    consolidated_data = {
        "session_id": session_id,
        "job_report_id": job_report_id,
        "transcriptions": transcriptions,
        "total_transcriptions": len(transcriptions),
        "num_questions": num_questions
    }
    
    output_key = f"responses-text/{session_id}/all_transcriptions.json"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=output_key,
        Body=json.dumps(consolidated_data, ensure_ascii=False),
        ContentType="application/json"
    )
    
    print(f"✅ Arquivo consolidado salvo: {output_key}")
    
    # Publica no SNS para acionar GenerateInterviewReport
    if SNS_TOPIC_ARN:
        sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=f"Transcrições prontas - Job {job_report_id}",
            Message=json.dumps({
                "session_id": session_id,
                "job_report_id": job_report_id,
                "num_questions": num_questions
            })
        )
        print(f"📢 Publicado no SNS")
    
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Transcriptions consolidated",
            "session_id": session_id,
            "total": len(transcriptions)
        })
    }

def lambda_handler(event, context):
    """
    Transcreve áudios de uma sessão.
    
    Modos:
    1. single_file=True: Transcreve apenas 1 áudio específico (chamado por ProcessUploadQueue)
    2. consolidate_only=True: Apenas consolida transcrições existentes
    3. Padrão: Transcreve TODOS os áudios (modo legado)
    
    Event esperado:
    {
        "session_id": "job-4-1234567890",
        "job_report_id": 4,
        "num_questions": 5,
        "single_file": true/false (opcional),
        "question_index": 0 (obrigatório se single_file=true),
        "consolidate_only": true/false (opcional)
    }
    """
    try:
        session_id = event.get("session_id")
        job_report_id = event.get("job_report_id")
        num_questions = event.get("num_questions", 5)
        single_file = event.get("single_file", False)
        question_index = event.get("question_index")
        consolidate_only = event.get("consolidate_only", False)
        
        if not session_id or job_report_id is None:
            raise ValueError("session_id e job_report_id são obrigatórios")
        
        # Modo: apenas consolidação
        if consolidate_only:
            print(f"📦 Consolidando transcrições da sessão {session_id}")
            return consolidate_transcriptions(session_id, job_report_id, num_questions)
        
        # Modo: arquivo único
        if single_file:
            if question_index is None:
                raise ValueError("question_index é obrigatório quando single_file=True")
            print(f"🎙️ Transcrevendo áudio {question_index} da sessão {session_id}")
            return transcribe_single_audio(session_id, job_report_id, question_index)
        
        # Modo legado: transcreve tudo
        print(f"🎙️ Iniciando transcrição de {num_questions} áudios da sessão {session_id}")
        
        # Lista todos os áudios da sessão
        prefix = f"responses-audios/{session_id}/"
        response = s3.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=prefix
        )
        
        audio_files = []
        if "Contents" in response:
            audio_files = [obj["Key"] for obj in response["Contents"] if obj["Key"].endswith(".mp3")]
        
        print(f"📁 Encontrados {len(audio_files)} áudios: {audio_files}")
        
        if len(audio_files) != num_questions:
            print(f"⚠️ Esperado {num_questions} áudios, encontrado {len(audio_files)}")
        
        # Transcreve cada áudio
        transcriptions = []
        for i, audio_key in enumerate(sorted(audio_files)):
            print(f"🔄 Transcrevendo {i+1}/{len(audio_files)}: {audio_key}")
            
            # Inicia job de transcrição
            job_name = f"{session_id}-q{i}-{int(time.time())}"
            media_uri = f"s3://{BUCKET_NAME}/{audio_key}"
            
            transcribe.start_transcription_job(
                TranscriptionJobName=job_name,
                Media={"MediaFileUri": media_uri},
                MediaFormat="mp3",
                LanguageCode="pt-BR",  # ou "en-US"
                OutputBucketName=BUCKET_NAME,
                OutputKey=f"responses-text/{session_id}/transcription_{i}.json"
            )
            
            # Aguarda conclusão (com timeout)
            max_wait = 300  # 5 minutos
            waited = 0
            while waited < max_wait:
                status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
                job_status = status["TranscriptionJob"]["TranscriptionJobStatus"]
                
                if job_status == "COMPLETED":
                    # Obtém transcrição
                    transcript_uri = status["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
                    # Baixa o JSON da transcrição
                    output_key = f"responses-text/{session_id}/transcription_{i}.json"
                    transcript_obj = s3.get_object(Bucket=BUCKET_NAME, Key=output_key)
                    transcript_data = json.loads(transcript_obj["Body"].read())
                    
                    text = transcript_data["results"]["transcripts"][0]["transcript"]
                    transcriptions.append({
                        "question_index": i,
                        "audio_key": audio_key,
                        "transcription": text
                    })
                    print(f"✅ Transcrição {i+1} completa: {text[:100]}...")
                    break
                elif job_status == "FAILED":
                    print(f"❌ Transcrição {i+1} falhou")
                    transcriptions.append({
                        "question_index": i,
                        "audio_key": audio_key,
                        "transcription": "[Erro na transcrição]",
                        "error": True
                    })
                    break
                
                time.sleep(2)
                waited += 2
            
            # Limpa job de transcrição
            try:
                transcribe.delete_transcription_job(TranscriptionJobName=job_name)
            except:
                pass
        
        # Salva todas as transcrições no S3 como JSON consolidado
        transcriptions_json = {
                "session_id": session_id,
                "job_report_id": job_report_id,
                "transcriptions": transcriptions,
                "status": "COMPLETED",
            "created_at": time.time(),
            "num_questions": num_questions
        }
        
        transcriptions_key = f"responses-text/{session_id}/all_transcriptions.json"
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=transcriptions_key,
            Body=json.dumps(transcriptions_json, indent=2),
            ContentType="application/json"
        )
        
        print(f"💾 Transcrições salvas em: s3://{BUCKET_NAME}/{transcriptions_key}")
        
        # Publica no SNS para notificar conclusão
        if SNS_TOPIC_ARN:
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject=f"Transcrição completa - Job {job_report_id}",
                Message=json.dumps({
                    "event": "transcription_completed",
                    "session_id": session_id,
                    "job_report_id": job_report_id,
                    "num_transcriptions": len(transcriptions),
                    "s3_path": f"s3://{BUCKET_NAME}/{transcriptions_key}"
                }, indent=2)
        )
        
        print(f"🎉 Todas as transcrições completas para sessão {session_id}")
        
        # Aciona lambda de geração de relatório (se existir)
        report_lambda_arn = os.environ.get("GENERATE_REPORT_LAMBDA_ARN")
        if report_lambda_arn:
            lambda_client = boto3.client("lambda")
            lambda_client.invoke(
                FunctionName=report_lambda_arn,
                InvocationType="Event",
                Payload=json.dumps({
                    "session_id": session_id,
                    "job_report_id": job_report_id
                })
            )
            print(f"🚀 Lambda de relatório acionada")
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Transcrições completas",
                "session_id": session_id,
                "transcriptions_count": len(transcriptions)
            })
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }


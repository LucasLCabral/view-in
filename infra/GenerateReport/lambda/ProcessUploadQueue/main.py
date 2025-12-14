import json
import os
import boto3

s3 = boto3.client("s3")
lambda_client = boto3.client("lambda")
sns = boto3.client("sns")

BUCKET_NAME = os.environ["BUCKET_NAME"]
TRANSCRIBE_LAMBDA_ARN = os.environ.get("TRANSCRIBE_LAMBDA_ARN")
SNS_TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN")

def lambda_handler(event, context):
    """
    Processa mensagens da fila SQS.
    Verifica se todos os áudios foram enviados.
    Se sim, aciona transcrição. Se não, recoloca na fila.
    
    Triggered by SQS:
    {
        "Records": [{
            "body": "{\"session_id\": \"...\", \"job_report_id\": 4, \"num_questions\": 5}"
        }]
    }
    """
    try:
        for record in event.get("Records", []):
            message_body = json.loads(record["body"])
            
            session_id = message_body["session_id"]
            job_report_id = message_body["job_report_id"]
            num_questions = message_body["num_questions"]
            
            print(f"🔍 Verificando sessão {session_id}")
            
            # Lista áudios enviados
            audio_prefix = f"responses-audios/{session_id}/"
            audio_response = s3.list_objects_v2(
                Bucket=BUCKET_NAME,
                Prefix=audio_prefix
            )
            
            audio_files = []
            if "Contents" in audio_response:
                audio_files = [
                    obj["Key"] for obj in audio_response["Contents"] 
                    if obj["Key"].endswith(".mp3")
                ]
            
            uploaded_count = len(audio_files)
            print(f"📊 Sessão {session_id}: {uploaded_count}/{num_questions} áudios")
            
            # Verifica quais já foram transcritos
            transcription_prefix = f"responses-text/{session_id}/"
            transcription_response = s3.list_objects_v2(
                Bucket=BUCKET_NAME,
                Prefix=transcription_prefix
            )
            
            transcribed_files = set()
            if "Contents" in transcription_response:
                transcribed_files = {
                    obj["Key"] for obj in transcription_response["Contents"]
                    if obj["Key"].endswith(".json") and "transcription_" in obj["Key"]
                }
            
            transcribed_count = len(transcribed_files)
            print(f"📝 Transcrições existentes: {transcribed_count}/{uploaded_count}")
            
            # Transcreve os áudios que ainda não foram transcritos
            if transcribed_count < uploaded_count:
                print(f"🚀 Iniciando transcrição de {uploaded_count - transcribed_count} áudios novos...")
                
                for audio_key in audio_files:
                    # Extrai o índice do áudio (resposta_N.mp3)
                    filename = audio_key.split("/")[-1]
                    question_index = filename.replace("resposta_", "").replace(".mp3", "")
                    
                    # Verifica se já foi transcrito
                    transcription_key = f"{transcription_prefix}transcription_{question_index}.json"
                    if transcription_key not in transcribed_files:
                        print(f"  📤 Transcrevendo {filename}...")
                        
                        # Invoca TranscribeResponses para este áudio específico
                        if TRANSCRIBE_LAMBDA_ARN:
                            lambda_client.invoke(
                                FunctionName=TRANSCRIBE_LAMBDA_ARN,
                                InvocationType="Event",  # Async
                                Payload=json.dumps({
                                    "session_id": session_id,
                                    "job_report_id": job_report_id,
                                    "question_index": int(question_index),
                                    "single_file": True
                                })
                            )
            
            # Se todos os áudios foram enviados e transcritos, consolida
            if uploaded_count >= num_questions and transcribed_count >= num_questions:
                print(f"✅ Todos os áudios transcritos! Consolidando...")
                
                # Aciona lambda de transcrição para consolidar
                if TRANSCRIBE_LAMBDA_ARN:
                    lambda_client.invoke(
                        FunctionName=TRANSCRIBE_LAMBDA_ARN,
                        InvocationType="Event",  # Async
                        Payload=json.dumps({
                            "session_id": session_id,
                            "job_report_id": job_report_id,
                            "num_questions": num_questions,
                            "consolidate_only": True
                        })
                    )
                    print(f"🚀 Consolidação acionada")
                
                # Publica no SNS para notificações (opcional)
                if SNS_TOPIC_ARN:
                    sns.publish(
                        TopicArn=SNS_TOPIC_ARN,
                        Subject=f"Transcrição iniciada - Job {job_report_id}",
                        Message=json.dumps({
                            "event": "transcription_started",
                            "session_id": session_id,
                            "job_report_id": job_report_id,
                            "num_questions": num_questions
                        })
                    )
                
                # Mensagem processada com sucesso
                return {
                    "statusCode": 200,
                    "body": json.dumps({
                        "message": "Transcrição acionada",
                        "session_id": session_id
                    })
                }
            else:
                # Ainda faltam áudios
                print(f"⏳ Ainda faltam {num_questions - uploaded_count} áudios")
                
                # Retorna erro para recolocar na fila (com backoff automático do SQS)
                raise Exception(
                    f"Ainda faltam áudios: {uploaded_count}/{num_questions}"
                )
        
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Processed"})
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        # Lança exceção para SQS retentar
        raise e


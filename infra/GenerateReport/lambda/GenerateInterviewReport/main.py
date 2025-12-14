import json
import os
import boto3
import uuid
import re
import requests
import codecs
from datetime import datetime

s3 = boto3.client("s3")
bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

BUCKET_NAME = os.environ["BUCKET_NAME"]
AGENT_ID = os.environ.get("BEDROCK_AGENT_ID", "U1F06PNPK3")
AGENT_ALIAS_ID = os.environ.get("BEDROCK_AGENT_ALIAS_ID", "MZPYGLDR5T")
BACKEND_PUBLIC_URL = os.environ.get("BACKEND_PUBLIC_URL")

def extract_id_from_key(s3_key):
    parts = s3_key.split("/")
    if len(parts) >= 2 and parts[0] == "responses-text":
        return parts[1]
    return None

def find_script_by_id(session_id):
    try:
        scripts = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="scripts/")
        for obj in scripts.get("Contents", []):
            script_key = obj["Key"]
            if script_key.endswith(".json"):
                script_id = os.path.basename(script_key).replace("roteiro-", "").replace(".json", "")
                if script_id == session_id or session_id in script_key:
                    script_obj = s3.get_object(Bucket=BUCKET_NAME, Key=script_key)
                    return json.loads(script_obj["Body"].read())
        
        if scripts.get("Contents"):
            latest_script = max(scripts["Contents"], key=lambda x: x["LastModified"])
            script_obj = s3.get_object(Bucket=BUCKET_NAME, Key=latest_script["Key"])
            return json.loads(script_obj["Body"].read())
        return None
    except Exception as e:
        print(f"Erro ao buscar script: {e}")
        return None

def get_script_from_session_id(session_id):
    try:
        script_key = f"scripts/roteiro-{session_id}.json"
        try:
            script_obj = s3.get_object(Bucket=BUCKET_NAME, Key=script_key)
            return json.loads(script_obj["Body"].read())
        except s3.exceptions.NoSuchKey:
            return find_script_by_id(session_id)
    except Exception as e:
        print(f"Erro ao buscar script para session_id {session_id}: {e}")
        return None

def get_all_transcriptions(session_id):
    transcriptions_key = f"responses-text/{session_id}/all_transcriptions.json"
    try:
        print(f"🔍 Buscando transcrições em: {transcriptions_key}")
        response_obj = s3.get_object(Bucket=BUCKET_NAME, Key=transcriptions_key)
        data = json.loads(response_obj["Body"].read().decode("utf-8"))
        
        transcriptions = {}
        for item in data.get("transcriptions", []):
            question_index = item.get("question_index")
            text = item.get("transcription", "")
            transcriptions[f"resposta_{question_index}"] = text
        
        print(f"✅ Encontradas {len(transcriptions)} transcrições")
        return transcriptions
    except Exception as e:
        print(f"❌ Erro ao buscar transcrições: {str(e)}")
        return {}

def check_all_transcriptions_ready(session_id):
    transcriptions_key = f"responses-text/{session_id}/all_transcriptions.json"
    try:
        s3.head_object(Bucket=BUCKET_NAME, Key=transcriptions_key)
        print(f"✅ Arquivo de transcrições encontrado: {transcriptions_key}")
        return True
    except Exception as e:
        print(f"⏳ Arquivo de transcrições ainda não existe: {e}")
        return False

def build_input_text(script, transcriptions):
    perguntas = script.get("perguntas", []) if script else []
    respostas_list = list(transcriptions.values())
    
    input_text = ""
    if script and "introducao" in script:
        input_text += f"INTRODUÇÃO DA ENTREVISTA:\n{script['introducao']}\n\n"
    
    input_text += "PERGUNTAS E RESPOSTAS:\n\n"
    for i, pergunta in enumerate(perguntas):
        pergunta_texto = pergunta["texto"] if isinstance(pergunta, dict) else pergunta
        resposta_texto = respostas_list[i] if i < len(respostas_list) else "[Resposta não disponível]"
        input_text += f"PERGUNTA {i+1}:\n{pergunta_texto}\n\n"
        input_text += f"RESPOSTA {i+1}:\n{resposta_texto}\n\n"
        input_text += "---\n\n"
    
    if len(respostas_list) > len(perguntas):
        input_text += f"\nOBSERVAÇÃO: Existem {len(respostas_list) - len(perguntas)} resposta(s) adicional(is).\n\n"
        for i in range(len(perguntas), len(respostas_list)):
            input_text += f"RESPOSTA ADICIONAL {i+1}:\n{respostas_list[i]}\n\n"
    
    return input_text

def repair_incomplete_json(json_str):
    """
    Tenta reparar um JSON incompleto fechando aspas e estruturas abertas.
    """
    print("🛠️ Tentando reparar JSON incompleto...")
    json_str = json_str.strip()
    
    # 1. Remove vírgula final se existir (comum antes de fechar)
    if json_str.endswith(','):
        json_str = json_str[:-1]
        
    # 2. Fecha aspas abertas
    if json_str.count('"') % 2 != 0:
        json_str += '"'
        
    # 3. Descobre quais estruturas (objetos/arrays) estão abertas
    stack = []
    for char in json_str:
        if char == '{':
            stack.append('}')
        elif char == '[':
            stack.append(']')
        elif char == '}' or char == ']':
            if stack and stack[-1] == char:
                stack.pop()
    
    # 4. Fecha as estruturas na ordem inversa
    while stack:
        closer = stack.pop()
        json_str += closer
        
    return json_str

def lambda_handler(event, context):
    try:
        print(f"📥 Evento recebido: {json.dumps(event)}")
        
        # Suporta invocação direta ou via SNS
        if "Records" in event:
            # Invocação via SNS
            for record in event.get("Records", []):
                message = json.loads(record["Sns"]["Message"])
                session_id = message.get("session_id")
                job_report_id = message.get("job_report_id")
                
                if not session_id:
                    print(f"❌ Erro: session_id não encontrado na mensagem SNS")
                    continue
                
                print(f"🔍 Processando sessão (via SNS): {session_id}")
                print(f"📋 Job Report ID: {job_report_id}")
                process_report(session_id, job_report_id)
        else:
            # Invocação direta
            session_id = event.get("session_id")
            job_report_id = event.get("job_report_id")
            
            if not session_id:
                print(f"❌ Erro: session_id não encontrado no evento")
                return {"statusCode": 400, "body": json.dumps({"error": "session_id é obrigatório"})}
            
            print(f"🔍 Processando sessão (invocação direta): {session_id}")
            print(f"📋 Job Report ID: {job_report_id}")
            return process_report(session_id, job_report_id)
            
    except Exception as e:
        print(f"Erro fatal na Lambda: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def process_report(session_id, job_report_id):
            
            if not check_all_transcriptions_ready(session_id):
                print(f"Aguardando mais transcrições para a sessão {session_id}")
                return {"statusCode": 200, "body": "Aguardando transcrições"}
            
            report_key = f"reports/{session_id}/report.json"
            
            transcriptions = get_all_transcriptions(session_id)
            if not transcriptions:
                raise ValueError(f"Nenhuma transcrição encontrada para a sessão {session_id}")
            
            print(f"📊 Gerando relatório para {len(transcriptions)} respostas")
            
            script = get_script_from_session_id(session_id)
            input_text = build_input_text(script, transcriptions)
            
            print(f"🤖 Invocando agente Bedrock... (Input size: {len(input_text)} chars)")
            
            try:
                response = bedrock_agent.invoke_agent(
                    agentId=AGENT_ID,
                    agentAliasId=AGENT_ALIAS_ID,
                    sessionId=str(uuid.uuid4()),
                    inputText=input_text
                )
                
                # Usa decoder incremental para processar o stream UTF-8 corretamente
                decoder = codecs.getincrementaldecoder("utf-8")(errors='replace')
                full_response = ""
                
                for event in response.get("completion", []):
                    if "chunk" in event:
                        chunk = event["chunk"]
                        if "bytes" in chunk:
                            full_response += decoder.decode(chunk["bytes"], final=False)
                
                # Finaliza o decoder
                full_response += decoder.decode(b"", final=True)
                
                print(f"📄 Resposta recebida: {len(full_response)} chars")
                
                # Tenta extrair JSON
                match = re.search(r'\{[\s\S]*', full_response) # Pega do primeiro { até o fim (mesmo que não tenha })
                
                if match:
                    json_candidate = match.group(0)
                    try:
                        # Tenta parsear direto (se estiver completo)
                        report_data = json.loads(json_candidate)
                        print("✅ JSON válido e completo!")
                    except json.JSONDecodeError:
                        # Se falhar, tenta reparar
                        print("⚠️ JSON incompleto ou inválido, iniciando reparo...")
                        fixed_json = repair_incomplete_json(json_candidate)
                        try:
                            report_data = json.loads(fixed_json)
                            print("✅ JSON reparado com sucesso!")
                        except json.JSONDecodeError as e:
                            print(f"❌ Falha fatal ao reparar JSON: {e}")
                            # Fallback extremo: cria um JSON de erro válido
                            report_data = {
                                "error": "Relatório parcial devido a limite de resposta",
                                "raw_content": full_response
                            }
                else:
                    raise ValueError("Nenhum início de JSON encontrado na resposta")

                # Adiciona metadados
                report_data["session_id"] = session_id
                report_data["generated_at"] = datetime.now().isoformat()
                
                # Salva no S3
                s3.put_object(
                    Bucket=BUCKET_NAME,
                    Key=report_key,
                    Body=json.dumps(report_data, ensure_ascii=False, indent=2).encode("utf-8"),
                    ContentType="application/json"
                )
                
                print(f"Relatório salvo em: {report_key}")
                
                # Gera URL assinada
                report_url = s3.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": BUCKET_NAME, "Key": report_key},
                    ExpiresIn=604800
                )
                
                # Tenta recuperar callback_url do metadata
                callback_url = None
                if BACKEND_PUBLIC_URL:
                    callback_url = f"{BACKEND_PUBLIC_URL}/api/jobReport/callback/report-ready"
                
                try:
                    metadata_key = f"metadata/{session_id}.json"
                    print(f"🔍 Buscando metadata em: {metadata_key}")
                    metadata_obj = s3.get_object(Bucket=BUCKET_NAME, Key=metadata_key)
                    metadata = json.loads(metadata_obj["Body"].read())
                    
                    print(f"📦 Metadata encontrado: {json.dumps(metadata, indent=2)}")
                    
                    # Recupera job_report_id do metadata se não veio do SNS
                    if not job_report_id and metadata.get("job_report_id"):
                        job_report_id = metadata.get("job_report_id")
                        print(f"📋 Job Report ID recuperado do metadata: {job_report_id}")
                    
                    if metadata.get("callback_url"):
                        # Se o metadata tiver callback_url, usa ela (prioridade)
                        raw_url = metadata.get("callback_url")
                        # Ajusta URL se necessário (para o endpoint correto)
                        if "/callback/report-ready" not in raw_url:
                            if raw_url.endswith("/"):
                                callback_url = f"{raw_url}api/jobReport/callback/report-ready"
                            else:
                                callback_url = f"{raw_url}/api/jobReport/callback/report-ready"
                        else:
                            callback_url = raw_url
                            
                        print(f"🔗 Callback URL recuperada do metadata: {callback_url}")
                except Exception as e:
                    print(f"⚠️ Não foi possível ler metadata (usando fallback ENV): {e}")

                # Callback
                print(f"🔍 Verificando callback - URL: {callback_url}, Job ID: {job_report_id}")
                
                if callback_url and job_report_id:
                    payload = {
                        "session_id": session_id,
                        "report_path": f"s3://{BUCKET_NAME}/{report_key}",
                        "report_url": report_url,
                        "job_report_id": job_report_id
                    }
                    print(f"📞 Enviando callback para: {callback_url}")
                    print(f"📦 Payload: {json.dumps(payload, indent=2)}")
                    try:
                        response = requests.post(callback_url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
                        print(f"✅ Callback enviado com sucesso! Status: {response.status_code}")
                        print(f"📥 Resposta: {response.text}")
                    except Exception as e:
                        print(f"❌ Falha no envio do callback: {e}")
                else:
                    print(f"⚠️ Callback ignorado - callback_url: {callback_url is not None}, job_report_id: {job_report_id is not None}")
                
                return {
                    "statusCode": 200,
                    "body": json.dumps({"message": "Relatório gerado", "report_url": report_url})
                }
                
            except Exception as e:
                print(f"❌ Erro durante invocação ou processamento: {str(e)}")
                return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

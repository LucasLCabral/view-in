import json
import boto3
import os
import uuid
import re
from datetime import datetime

s3 = boto3.client("s3")
agent_runtime = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

def lambda_handler(event, context):
    try:
        # --- Corpo da requisição ---
        body = json.loads(event.get("body", "{}"))
        job_info = body.get("job_info", "")
        callback_url = body.get("callback_url")
        job_report_id = body.get("job_report_id")
        
        if not job_info:
            raise ValueError("Campo 'job_info' não encontrado no corpo da requisição.")

        bucket_name = os.environ["BUCKET_NAME"]
        
        # Gera session_id (UUID) que será usado para organizar todos os arquivos
        session_id = str(uuid.uuid4())

        # --- Invoca o agente no Bedrock ---
        response = agent_runtime.invoke_agent(
            agentId="Y32KRP3JHL",
            agentAliasId="WZUDFCOGY7",
            sessionId=session_id,
            inputText=job_info
        )

        # A resposta vem como um streaming de chunks — precisamos juntar tudo
        full_response = ""
        for event_stream in response["completion"]:
            if "chunk" in event_stream:
                full_response += event_stream["chunk"]["bytes"].decode("utf-8")

        # Busca o JSON no meio do texto (caso o agente fale algo a mais)
        match = re.search(r'\{[\s\S]*\}', full_response)
        if not match:
            raise ValueError("Nenhum JSON válido encontrado na resposta do agente.")

        json_text = match.group(0)
        roteiro = json.loads(json_text)

        # --- Salva script no S3 usando session_id ---
        filename = f"scripts/roteiro-{session_id}.json"
        s3.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=json.dumps(roteiro, ensure_ascii=False, indent=2).encode("utf-8"),
            ContentType="application/json"
        )

        # --- Salva metadata no S3 ---
        if callback_url or job_report_id:
            metadata = {
                "callback_url": callback_url,
                "job_report_id": job_report_id,
                "session_id": session_id,
                "created_at": datetime.now().isoformat()
            }
            metadata_key = f"metadata/{session_id}.json"
            s3.put_object(
                Bucket=bucket_name,
                Key=metadata_key,
                Body=json.dumps(metadata, ensure_ascii=False, indent=2).encode("utf-8"),
                ContentType="application/json"
            )

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "message": "Roteiro gerado com sucesso via agente e salvo no S3!",
                "s3_path": f"s3://{bucket_name}/{filename}",
                "session_id": session_id,
                "preview": roteiro
            })
        }

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

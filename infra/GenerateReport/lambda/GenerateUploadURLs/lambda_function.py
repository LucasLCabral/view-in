import json
import os
import boto3
from datetime import datetime

s3 = boto3.client("s3")
sqs = boto3.client("sqs")

BUCKET_NAME = os.environ["BUCKET_NAME"]
UPLOAD_QUEUE_URL = os.environ["UPLOAD_QUEUE_URL"]

def lambda_handler(event, context):
    """
    Gera URLs pré-assinadas para upload de múltiplas respostas de áudio.
    Salva metadados no S3 e envia mensagem para SQS.
    
    Body esperado:
    {
        "job_report_id": 4,
        "num_questions": 5,
        "callback_url": "https://..." (opcional)
    }
    """
    try:
        body = json.loads(event.get("body", "{}"))
        
        job_report_id = body.get("job_report_id")
        num_questions = body.get("num_questions", 5)
        callback_url = body.get("callback_url")
        
        if not job_report_id:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "job_report_id é obrigatório"})
            }
        
        # Cria session_id único
        session_id = f"job-{job_report_id}-{int(datetime.now().timestamp())}"
        
        # Salva metadata no S3 (CRUCIAL para o callback funcionar depois)
        metadata = {
            "session_id": session_id,
            "job_report_id": job_report_id,
            "num_questions": num_questions,
            "callback_url": callback_url,
            "created_at": datetime.now().isoformat()
        }
        
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=f"metadata/{session_id}.json",
            Body=json.dumps(metadata),
            ContentType="application/json"
        )
        print(f"✅ Metadata salvo para sessão {session_id}")
        
        # Gera URLs para cada resposta
        upload_urls = []
        for i in range(num_questions):
            question_number = i + 1
            s3_key = f"responses-audios/{session_id}/resposta_{question_number}.mp3"
            
            presigned_url = s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": BUCKET_NAME,
                    "Key": s3_key,
                    "ContentType": "audio/mpeg"
                },
                ExpiresIn=3600
            )
            
            upload_urls.append({
                "question_index": i,
                "presigned_url": presigned_url,
                "s3_key": s3_key
            })
        
        # Envia mensagem para SQS com delay
        delay_seconds = min(300, 60 * num_questions)
        
        sqs.send_message(
            QueueUrl=UPLOAD_QUEUE_URL,
            MessageBody=json.dumps({
                "session_id": session_id,
                "job_report_id": job_report_id,
                "num_questions": num_questions,
                "created_at": datetime.now().isoformat()
            }),
            DelaySeconds=delay_seconds
        )
        
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "session_id": session_id,
                "job_report_id": job_report_id,
                "upload_urls": upload_urls,
                "expires_in": 3600
            })
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }

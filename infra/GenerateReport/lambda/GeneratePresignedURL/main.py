import json
import os
import boto3
import uuid

s3 = boto3.client("s3")
BUCKET_NAME = os.environ["BUCKET_NAME"]
REGION = os.environ.get("AWS_REGION", "us-east-1")

def lambda_handler(event, context):
    """
    Gera uma URL pré-assinada para upload ou download de arquivo no S3.
    
    Para upload: envia session_id e filename no body
    Para download: envia bucket e key (ou s3_path) no body
    """
    try:
        # Parse do body
        body = json.loads(event.get("body", "{}"))
        
        # Verifica se é para download (tem bucket e key ou s3_path)
        if "bucket" in body and "key" in body:
            # Modo download
            bucket = body.get("bucket")
            key = body.get("key")
            operation = body.get("operation", "get_object")  # get_object por padrão
            
            # Gera URL pré-assinada para GET (download)
            presigned_url = s3.generate_presigned_url(
                operation,
                Params={
                    "Bucket": bucket,
                    "Key": key
                },
                ExpiresIn=3600  # 1 hora
            )
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "presigned_url": presigned_url,
                    "bucket": bucket,
                    "key": key,
                    "expires_in": 3600
                })
            }
        elif "s3_path" in body:
            # Modo download com s3_path completo
            s3_path = body.get("s3_path")
            # Remove s3:// prefix
            path = s3_path.replace("s3://", "")
            first_slash = path.find("/")
            if first_slash == -1:
                raise ValueError(f"Invalid S3 path format: {s3_path}")
            
            bucket = path[:first_slash]
            key = path[first_slash + 1:]
            
            # Gera URL pré-assinada para GET (download) com Content-Type para áudio
            presigned_url = s3.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": bucket,
                    "Key": key,
                    "ResponseContentType": "audio/mpeg"
                },
                ExpiresIn=3600  # 1 hora
            )
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "presigned_url": presigned_url,
                    "s3_path": s3_path,
                    "bucket": bucket,
                    "key": key,
                    "expires_in": 3600
                })
            }
        else:
            # Modo upload (comportamento original)
            session_id = body.get("session_id")
            
            # Se não fornecido, gera um novo ID
            if not session_id:
                session_id = str(uuid.uuid4())
            
            # Nome do arquivo (pode ser enviado pelo cliente ou gerado)
            filename = body.get("filename", f"resposta_{int(context.aws_request_id[:8], 16)}.mp3")
            
            # Chave S3: responses-audios/{session_id}/{filename}
            s3_key = f"responses-audios/{session_id}/{filename}"
            
            # Gera URL pré-assinada para PUT (upload)
            presigned_url = s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": BUCKET_NAME,
                    "Key": s3_key,
                    "ContentType": "audio/mpeg"
                },
                ExpiresIn=3600  # 1 hora
            )
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "session_id": session_id,
                    "presigned_url": presigned_url,
                    "s3_key": s3_key,
                    "expires_in": 3600
                })
            }
    
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "error": str(e)
            })
        }

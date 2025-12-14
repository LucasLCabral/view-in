import json
import os
import boto3
import requests

s3 = boto3.client("s3")
ELEVENLABS_API_KEY = os.environ["ELEVENLABS_API_KEY"]
BUCKET_NAME = os.environ["BUCKET_NAME"]

def gerar_audio(text, parte, s3_key):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/Xb7hH8MSUJpSbSDYk0k2"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "model_id": "eleven_flash_v2_5",
        "text": text,
        "voice_settings": {"stability": 0.3, "similarity_boost": 0.8}
    }

    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Erro ElevenLabs: {response.text}")

    # Extrai session_id do nome do arquivo (roteiro-{session_id}.json)
    script_name = os.path.basename(s3_key).replace('.json', '')
    session_id = script_name.replace('roteiro-', '')
    
    audio_key = f"audios/{script_name}/{parte}.mp3"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=audio_key,
        Body=response.content,
        ContentType="audio/mpeg"
    )
    return f"s3://{BUCKET_NAME}/{audio_key}"

def lambda_handler(event, context):
    record = event["Records"][0]
    s3_key = record["s3"]["object"]["key"]
    response = s3.get_object(Bucket=BUCKET_NAME, Key=s3_key)
    roteiro = json.loads(response["Body"].read())

    # Extrai session_id do nome do arquivo
    script_name = os.path.basename(s3_key).replace('.json', '')
    session_id = script_name.replace('roteiro-', '')

    audio_files = []
    if "introducao" in roteiro:
        audio_files.append(gerar_audio(roteiro["introducao"], "introducao", s3_key))
    for i, pergunta in enumerate(roteiro.get("perguntas", [])):
        text = pergunta["texto"] if isinstance(pergunta, dict) else pergunta
        audio_files.append(gerar_audio(text, f"pergunta_{i+1}", s3_key))

    # Busca metadata para fazer callback
    try:
        metadata_key = f"metadata/{session_id}.json"
        metadata_obj = s3.get_object(Bucket=BUCKET_NAME, Key=metadata_key)
        metadata = json.loads(metadata_obj["Body"].read())
        callback_url = metadata.get("callback_url")
        job_report_id = metadata.get("job_report_id")

        # Faz callback para o backend
        if callback_url:
            callback_payload = {
                "session_id": session_id,
                "audio_files": audio_files,
                "job_report_id": job_report_id
            }
            
            # Adiciona /api/jobReport ao callback_url se não tiver
            if not callback_url.endswith("/api/jobReport"):
                if callback_url.endswith("/"):
                    callback_url = callback_url + "api/jobReport/callback/audios-ready"
                else:
                    callback_url = callback_url + "/api/jobReport/callback/audios-ready"
            else:
                callback_url = callback_url + "/callback/audios-ready"
            
            try:
                requests.post(
                    callback_url,
                    json=callback_payload,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                print(f"Callback enviado com sucesso para {callback_url}")
            except Exception as e:
                print(f"Erro ao fazer callback: {str(e)}")
                # Não falha a Lambda se o callback falhar
    except Exception as e:
        print(f"Erro ao buscar metadata ou fazer callback: {str(e)}")
        # Continua mesmo se não conseguir fazer callback

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Áudios gerados com sucesso via ElevenLabs API!",
            "audio_files": audio_files,
            "session_id": session_id
        })
    }

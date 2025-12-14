# Event Source: S3 → GenerateInterviewAudios
# Trigger quando arquivo roteiro-*.json é criado no bucket
resource "aws_s3_bucket_notification" "lambda_trigger" {
  bucket = aws_s3_bucket.main.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.generate_interview_audios.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "scripts/"
    filter_suffix       = ".json"
  }

  # Depende da permissão da Lambda para ser invocada pelo S3
  depends_on = [aws_lambda_permission.s3_invoke_generate_audios]
}

# Permissão para S3 invocar a Lambda GenerateInterviewAudios
resource "aws_lambda_permission" "s3_invoke_generate_audios" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_interview_audios.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.main.arn
}

# Event Source: SQS → ProcessUploadQueue
# Trigger quando mensagem chega na fila SQS
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.upload_queue.arn
  function_name    = aws_lambda_function.process_upload_queue.arn
  enabled          = true

  batch_size                         = 1 # Processar uma mensagem por vez
  maximum_batching_window_in_seconds  = 0
  maximum_concurrency                = 5 # Máximo de execuções simultâneas

  # Configurações de retry
  function_response_types = []
  
  # Dead Letter Queue (opcional)
  # destination_config {
  #   on_failure {
  #     destination_arn = aws_sqs_queue.upload_queue_dlq.arn
  #   }
  # }
}

# Event Source: SNS → GenerateInterviewReport
# Já configurado em sns.tf via aws_sns_topic_subscription
# Este arquivo mantém apenas para referência e event sources adicionais




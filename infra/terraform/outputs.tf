output "s3_bucket_name" {
  description = "Nome do bucket S3"
  value       = aws_s3_bucket.main.id
}

output "s3_bucket_arn" {
  description = "ARN do bucket S3"
  value       = aws_s3_bucket.main.arn
}

output "sqs_queue_url" {
  description = "URL da fila SQS"
  value       = aws_sqs_queue.upload_queue.url
}

output "sqs_queue_arn" {
  description = "ARN da fila SQS"
  value       = aws_sqs_queue.upload_queue.arn
}

output "sns_topic_arn" {
  description = "ARN do tópico SNS"
  value       = aws_sns_topic.transcription_events.arn
}

output "lambda_function_arns" {
  description = "ARNs de todas as funções Lambda"
  value = {
    generate_interview_audios    = aws_lambda_function.generate_interview_audios.arn
    generate_interview_questions  = aws_lambda_function.generate_interview_questions.arn
    generate_interview_report    = aws_lambda_function.generate_interview_report.arn
    generate_presigned_url       = aws_lambda_function.generate_presigned_url.arn
    generate_upload_urls         = aws_lambda_function.generate_upload_urls.arn
    process_upload_queue         = aws_lambda_function.process_upload_queue.arn
    transcribe_responses         = aws_lambda_function.transcribe_responses.arn
  }
}

output "lambda_function_urls" {
  description = "URLs das Lambda Function URLs (se configuradas)"
  value = {
    generate_interview_questions = try(aws_lambda_function_url.generate_interview_questions.function_url, null)
    generate_interview_report   = try(aws_lambda_function_url.generate_interview_report.function_url, null)
    generate_presigned_url      = try(aws_lambda_function_url.generate_presigned_url.function_url, null)
    generate_upload_urls        = try(aws_lambda_function_url.generate_upload_urls.function_url, null)
  }
  sensitive = false
}

output "iam_role_arns" {
  description = "ARNs das IAM Roles das Lambdas"
  value = {
    generate_interview_audios   = aws_iam_role.generate_interview_audios_role.arn
    generate_interview_questions = aws_iam_role.generate_interview_questions_role.arn
    generate_interview_report   = aws_iam_role.generate_interview_report_role.arn
    generate_presigned_url     = aws_iam_role.generate_presigned_url_role.arn
    generate_upload_urls        = aws_iam_role.generate_upload_urls_role.arn
    process_upload_queue        = aws_iam_role.process_upload_queue_role.arn
    transcribe_responses        = aws_iam_role.transcribe_responses_role.arn
  }
}

output "account_id" {
  description = "ID da conta AWS"
  value       = data.aws_caller_identity.current.account_id
}

output "region" {
  description = "Região AWS atual"
  value       = data.aws_region.current.name
}




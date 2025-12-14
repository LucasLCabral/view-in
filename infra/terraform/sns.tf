# Tópico SNS para eventos de transcrição
resource "aws_sns_topic" "transcription_events" {
  name              = var.sns_topic_name
  display_name      = "Interview Transcription Events"
  kms_master_key_id = "alias/aws/sns" # Usar KMS padrão da AWS (opcional)
}

# Subscription: Lambda GenerateInterviewReport
resource "aws_sns_topic_subscription" "report_lambda" {
  topic_arn = aws_sns_topic.transcription_events.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.generate_interview_report.arn
}

# Permissão para SNS invocar a Lambda
resource "aws_lambda_permission" "sns_invoke_report" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_interview_report.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.transcription_events.arn
}



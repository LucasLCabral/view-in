# Fila SQS para processar uploads de áudio
resource "aws_sqs_queue" "upload_queue" {
  name                      = var.sqs_queue_name
  message_retention_seconds = 1209600 # 14 dias
  visibility_timeout_seconds = 300    # 5 minutos (ajuste conforme timeout da Lambda)
  receive_wait_time_seconds  = 20     # Long polling

  # Dead Letter Queue (opcional, descomente se necessário)
  # redrive_policy = jsonencode({
  #   deadLetterTargetArn = aws_sqs_queue.upload_queue_dlq.arn
  #   maxReceiveCount     = 3
  # })
}

# Dead Letter Queue (opcional)
# resource "aws_sqs_queue" "upload_queue_dlq" {
#   name = "${var.sqs_queue_name}-dlq"
#   message_retention_seconds = 1209600 # 14 dias
# }

# Política da fila SQS (permitir Lambdas enviarem mensagens)
resource "aws_sqs_queue_policy" "upload_queue" {
  queue_url = aws_sqs_queue.upload_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = [
            aws_iam_role.generate_upload_urls_role.arn,
            aws_iam_role.process_upload_queue_role.arn,
            aws_iam_role.transcribe_responses_role.arn
          ]
        }
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueUrl",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.upload_queue.arn
      }
    ]
  })
}



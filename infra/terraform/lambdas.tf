# Lambda: GenerateInterviewAudios
# Triggered by S3 events (roteiro-*.json files)
resource "aws_lambda_function" "generate_interview_audios" {
  function_name = var.lambda_function_names.generate_interview_audios
  role          = aws_iam_role.generate_interview_audios_role.arn
  handler       = "main.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300 # 5 minutos
  memory_size   = 256

  filename         = data.archive_file.lambda_generate_interview_audios.output_path
  source_code_hash = data.archive_file.lambda_generate_interview_audios.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME        = aws_s3_bucket.main.id
      ELEVENLABS_API_KEY = var.elevenlabs_api_key
    }
  }
}

# Archive para código da Lambda GenerateInterviewAudios
data "archive_file" "lambda_generate_interview_audios" {
  type        = "zip"
  source_file = "${path.module}/../GenerateInterview/lambda/GenerateInterviewAudios/main.py"
  output_path = "${path.module}/lambda_packages/lambda_generate_interview_audios.zip"
}

# Lambda: GenerateInterviewQuestions
resource "aws_lambda_function" "generate_interview_questions" {
  function_name = var.lambda_function_names.generate_interview_questions
  role          = aws_iam_role.generate_interview_questions_role.arn
  handler       = "main.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 512

  filename         = data.archive_file.lambda_generate_interview_questions.output_path
  source_code_hash = data.archive_file.lambda_generate_interview_questions.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.main.id
    }
  }
}

data "archive_file" "lambda_generate_interview_questions" {
  type        = "zip"
  source_file = "${path.module}/../GenerateInterview/lambda/GenerateInterviewQuestions/main.py"
  output_path = "${path.module}/lambda_packages/lambda_generate_interview_questions.zip"
}

# Lambda: GenerateInterviewReport
resource "aws_lambda_function" "generate_interview_report" {
  function_name = var.lambda_function_names.generate_interview_report
  role          = aws_iam_role.generate_interview_report_role.arn
  handler       = "main.lambda_handler"
  runtime       = "python3.11"
  timeout       = 900 # 15 minutos (relatórios podem demorar)
  memory_size   = 1024

  filename         = data.archive_file.lambda_generate_interview_report.output_path
  source_code_hash = data.archive_file.lambda_generate_interview_report.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME            = aws_s3_bucket.main.id
      BEDROCK_AGENT_ID       = var.bedrock_report_agent_id
      BEDROCK_AGENT_ALIAS_ID = var.bedrock_report_agent_alias_id
      BACKEND_PUBLIC_URL     = var.backend_public_url
    }
  }
}

data "archive_file" "lambda_generate_interview_report" {
  type        = "zip"
  source_file = "${path.module}/../GenerateReport/lambda/GenerateInterviewReport/main.py"
  output_path = "${path.module}/lambda_packages/lambda_generate_interview_report.zip"
}

# Lambda: GeneratePresignedURL
resource "aws_lambda_function" "generate_presigned_url" {
  function_name = var.lambda_function_names.generate_presigned_url
  role          = aws_iam_role.generate_presigned_url_role.arn
  handler       = "main.lambda_handler"
  runtime       = "python3.11"
  timeout       = 30
  memory_size   = 128

  filename         = data.archive_file.lambda_generate_presigned_url.output_path
  source_code_hash = data.archive_file.lambda_generate_presigned_url.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.main.id
      AWS_REGION  = var.aws_region
    }
  }
}

data "archive_file" "lambda_generate_presigned_url" {
  type        = "zip"
  source_file = "${path.module}/../GenerateReport/lambda/GeneratePresignedURL/main.py"
  output_path = "${path.module}/lambda_packages/lambda_generate_presigned_url.zip"
}

# Lambda: GenerateUploadURLs
resource "aws_lambda_function" "generate_upload_urls" {
  function_name = var.lambda_function_names.generate_upload_urls
  role          = aws_iam_role.generate_upload_urls_role.arn
  handler       = "lambda_function.lambda_handler" # Arquivo é lambda_function.py
  runtime       = "python3.11"
  timeout       = 30
  memory_size   = 128

  filename         = data.archive_file.lambda_generate_upload_urls.output_path
  source_code_hash = data.archive_file.lambda_generate_upload_urls.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME      = aws_s3_bucket.main.id
      UPLOAD_QUEUE_URL = aws_sqs_queue.upload_queue.url
    }
  }
}

data "archive_file" "lambda_generate_upload_urls" {
  type        = "zip"
  source_file = "${path.module}/../GenerateReport/lambda/GenerateUploadURLs/lambda_function.py"
  output_path = "${path.module}/lambda_packages/lambda_generate_upload_urls.zip"
}

# Lambda: ProcessUploadQueue
resource "aws_lambda_function" "process_upload_queue" {
  function_name = var.lambda_function_names.process_upload_queue
  role          = aws_iam_role.process_upload_queue_role.arn
  handler       = "main.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 256

  filename         = data.archive_file.lambda_process_upload_queue.output_path
  source_code_hash = data.archive_file.lambda_process_upload_queue.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME           = aws_s3_bucket.main.id
      TRANSCRIBE_LAMBDA_ARN = aws_lambda_function.transcribe_responses.arn
      SNS_TOPIC_ARN         = aws_sns_topic.transcription_events.arn
    }
  }
}

data "archive_file" "lambda_process_upload_queue" {
  type        = "zip"
  source_file = "${path.module}/../GenerateReport/lambda/ProcessUploadQueue/main.py"
  output_path = "${path.module}/lambda_packages/lambda_process_upload_queue.zip"
}

# Lambda: TranscribeResponses
resource "aws_lambda_function" "transcribe_responses" {
  function_name = var.lambda_function_names.transcribe_responses
  role          = aws_iam_role.transcribe_responses_role.arn
  handler       = "main.lambda_handler"
  runtime       = "python3.11"
  timeout       = 900 # 15 minutos (transcrições podem demorar)
  memory_size   = 512

  filename         = data.archive_file.lambda_transcribe_responses.output_path
  source_code_hash = data.archive_file.lambda_transcribe_responses.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME      = aws_s3_bucket.main.id
      SNS_TOPIC_ARN    = aws_sns_topic.transcription_events.arn
      UPLOAD_QUEUE_URL = aws_sqs_queue.upload_queue.url
    }
  }
}

data "archive_file" "lambda_transcribe_responses" {
  type        = "zip"
  source_file = "${path.module}/../GenerateReport/lambda/TranscribeResponses/main.py"
  output_path = "${path.module}/lambda_packages/lambda_transcribe_responses.zip"
}


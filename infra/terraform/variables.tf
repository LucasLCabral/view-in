variable "aws_region" {
  description = "Região AWS onde os recursos estão localizados"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "bucket_name" {
  description = "Nome do bucket S3 a ser criado (deve ser único globalmente)"
  type        = string
  default     = "interview-ai-assets"
}


variable "backend_bucket_name" {
  description = "Nome do bucket S3 para armazenar o state do Terraform"
  type        = string
}

variable "backend_key" {
  description = "Caminho do arquivo de state no bucket S3"
  type        = string
  default     = "viewin/infra/terraform.tfstate"
}

variable "backend_dynamodb_table" {
  description = "Nome da tabela DynamoDB para state locking (opcional)"
  type        = string
  default     = "terraform-state-lock"
}

variable "bedrock_agent_id" {
  description = "ID do Bedrock Agent para GenerateInterviewQuestions"
  type        = string
  default     = "Y32KRP3JHL"
}

variable "bedrock_agent_alias_id" {
  description = "ID do Bedrock Agent Alias para GenerateInterviewQuestions"
  type        = string
  default     = "WZUDFCOGY7"
}

variable "bedrock_report_agent_id" {
  description = "ID do Bedrock Agent para GenerateInterviewReport"
  type        = string
  default     = "U1F06PNPK3"
}

variable "bedrock_report_agent_alias_id" {
  description = "ID do Bedrock Agent Alias para GenerateInterviewReport"
  type        = string
  default     = "MZPYGLDR5T"
}

variable "elevenlabs_api_key" {
  description = "API Key do ElevenLabs (será usado como variável de ambiente nas Lambdas)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "backend_public_url" {
  description = "URL pública do backend para callbacks (opcional)"
  type        = string
  default     = ""
}

# Variáveis para nomes dos recursos a serem criados
variable "lambda_function_names" {
  description = "Nomes das funções Lambda a serem criadas"
  type = map(string)
  default = {
    generate_interview_audios    = "GenerateInterviewAudios"
    generate_interview_questions = "GenerateInterviewQuestions"
    generate_interview_report    = "GenerateInterviewReport"
    generate_presigned_url      = "GeneratePresignedURL"
    generate_upload_urls         = "GenerateUploadURLs"
    process_upload_queue        = "ProcessUploadQueue"
    transcribe_responses        = "TranscribeResponses"
  }
}

variable "sqs_queue_name" {
  description = "Nome da fila SQS a ser criada"
  type        = string
  default     = "interview-upload-queue"
}

variable "sns_topic_name" {
  description = "Nome do tópico SNS a ser criado"
  type        = string
  default     = "interview-transcription-events"
}



# Lambda Function URL para GenerateInterviewQuestions
resource "aws_lambda_function_url" "generate_interview_questions" {
  function_name      = aws_lambda_function.generate_interview_questions.function_name
  authorization_type = "NONE" # Ou "AWS_IAM" para autenticação

  cors {
    allow_credentials = false
    allow_origins     = ["*"] # Ajuste para domínios específicos em produção
    allow_methods     = ["POST", "GET"]
    allow_headers     = ["content-type", "x-amz-date", "authorization", "x-api-key"]
    expose_headers    = []
    max_age           = 86400
  }
}

# Lambda Function URL para GenerateInterviewReport (se necessário)
# Descomente se esta Lambda também precisa de Function URL
# resource "aws_lambda_function_url" "generate_interview_report" {
#   function_name      = aws_lambda_function.generate_interview_report.function_name
#   authorization_type = "NONE"
#
#   cors {
#     allow_credentials = false
#     allow_origins     = ["*"]
#     allow_methods     = ["POST", "GET"]
#     allow_headers     = ["content-type"]
#     expose_headers    = []
#     max_age           = 86400
#   }
# }

# Lambda Function URL para GeneratePresignedURL
resource "aws_lambda_function_url" "generate_presigned_url" {
  function_name      = aws_lambda_function.generate_presigned_url.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["*"] # Ajuste para domínios específicos em produção
    allow_methods     = ["POST", "GET", "OPTIONS"]
    allow_headers     = ["content-type", "authorization"]
    expose_headers    = []
    max_age           = 86400
  }
}

# Lambda Function URL para GenerateUploadURLs
resource "aws_lambda_function_url" "generate_upload_urls" {
  function_name      = aws_lambda_function.generate_upload_urls.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["*"] # Ajuste para domínios específicos em produção
    allow_methods     = ["POST", "GET", "OPTIONS"]
    allow_headers     = ["content-type", "authorization"]
    expose_headers    = []
    max_age           = 86400
  }
}

# Permissões para Function URLs invocarem as Lambdas
# (geralmente não necessário, mas pode ser útil para controle adicional)
# resource "aws_lambda_permission" "function_url_permissions" {
#   for_each = {
#     generate_interview_questions = aws_lambda_function_url.generate_interview_questions.function_url
#     generate_presigned_url      = aws_lambda_function_url.generate_presigned_url.function_url
#     generate_upload_urls        = aws_lambda_function_url.generate_upload_urls.function_url
#   }
#
#   statement_id  = "AllowFunctionURLInvoke"
#   action        = "lambda:InvokeFunctionUrl"
#   function_name = aws_lambda_function[each.key].function_name
#   principal     = "*"
#   function_url_auth_type = "NONE"
# }



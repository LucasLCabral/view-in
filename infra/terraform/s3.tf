# S3 Bucket para armazenar scripts, áudios, transcrições e relatórios
resource "aws_s3_bucket" "main" {
  bucket = var.bucket_name

}

# Configuração de versionamento (opcional, ajuste conforme necessário)
resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id

  versioning_configuration {
    status = "Disabled" # Altere para "Enabled" se necessário
  }
}

# Configuração de encriptação
resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Política de bloqueio de acesso público (recomendado)
resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy      = true
  ignore_public_acls      = true
  restrict_public_buckets  = true
}

# Lifecycle policy para limpar objetos antigos (opcional)
# Descomente e ajuste conforme necessário
# resource "aws_s3_bucket_lifecycle_configuration" "main" {
#   bucket = aws_s3_bucket.main.id
#
#   rule {
#     id     = "cleanup-old-files"
#     status = "Enabled"
#
#     expiration {
#       days = 90 # Manter arquivos por 90 dias
#     }
#   }
# }



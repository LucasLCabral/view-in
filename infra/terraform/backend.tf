# Backend S3 para state remoto
# Descomente e configure após criar o bucket

# terraform {
#   backend "s3" {
#     bucket         = "seu-terraform-state-bucket"
#     key            = "viewin/infra/terraform.tfstate"
#     region         = "us-east-1"
#     dynamodb_table = "terraform-state-lock"
#     encrypt        = true
#   }
# }

# Para usar este backend:
# 1. Crie um bucket S3 para o state (ex: terraform-state-viewin)
# 2. Crie uma tabela DynamoDB para locking (ex: terraform-state-lock)
# 3. Descomente e configure as linhas acima
# 4. Execute: terraform init -migrate-state




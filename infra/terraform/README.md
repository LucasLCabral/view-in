# Terraform - Infraestrutura AWS ViewIn

Este diretório contém a configuração Terraform para criar e gerenciar toda a infraestrutura AWS do projeto ViewIn do zero.

## 📋 Pré-requisitos

- Terraform >= 1.5 instalado
- AWS CLI configurado com credenciais válidas
- Acesso à conta AWS com permissões para criar recursos
- Python 3.11 (para empacotar código das Lambdas)

## 🚀 Início Rápido

### 1. Configurar Variáveis

Copie o arquivo de exemplo e preencha com seus valores:

```bash
cp terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars com seus valores
```

**Importante**: O arquivo `terraform.tfvars` está no `.gitignore` e não deve ser commitado.

**Variáveis obrigatórias**:
- `backend_bucket_name`: Nome do bucket S3 para armazenar o state do Terraform
- `elevenlabs_api_key`: API Key do ElevenLabs
- `bedrock_agent_id` e `bedrock_agent_alias_id`: IDs dos Bedrock Agents

### 2. Configurar Backend S3 (Recomendado)

Antes de iniciar, configure o backend S3 para armazenar o state do Terraform:

1. **Crie um bucket S3** para o state (ex: `terraform-state-viewin`)
   ```bash
   aws s3 mb s3://terraform-state-viewin --region us-east-1
   ```

2. **Crie uma tabela DynamoDB** para state locking (ex: `terraform-state-lock`)
   ```bash
   aws dynamodb create-table \
     --table-name terraform-state-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-east-1
   ```

3. **Edite `backend.tf`** e descomente/configure as linhas do backend:
   ```hcl
   terraform {
     backend "s3" {
       bucket         = "terraform-state-viewin"
       key            = "viewin/infra/terraform.tfstate"
       region         = "us-east-1"
       dynamodb_table = "terraform-state-lock"
       encrypt        = true
     }
   }
   ```

**Alternativa**: Se preferir usar state local inicialmente, deixe o backend comentado.

### 3. Inicializar Terraform

```bash
terraform init
```

### 4. Validar Configuração

```bash
terraform validate
terraform fmt  # Formatar código
```

### 5. Verificar o Plano

```bash
terraform plan
```

Revise o plano para garantir que todos os recursos serão criados corretamente.

### 6. Criar a Infraestrutura

```bash
terraform apply
```

Confirme digitando `yes` quando solicitado.

### 7. Obter Outputs

Após a criação, obtenha as URLs e informações importantes:

```bash
terraform output
```

As URLs das Lambda Function URLs serão exibidas e podem ser usadas no backend.

## 📁 Estrutura de Arquivos

```
terraform/
├── main.tf                 # Provider e configuração principal
├── backend.tf              # Configuração do backend S3
├── variables.tf            # Variáveis de entrada
├── outputs.tf              # Outputs (URLs, ARNs)
├── terraform.tfvars.example # Exemplo de valores
├── terraform.tfvars        # Seus valores (não commitado)
├── setup.sh                # Script auxiliar de setup
├── s3.tf                   # Bucket S3
├── sqs.tf                  # Fila SQS
├── sns.tf                  # Tópico SNS
├── iam.tf                  # IAM Roles e Policies
├── lambdas.tf              # Lambda Functions
├── lambda_urls.tf          # Lambda Function URLs
└── event_sources.tf        # Event Sources (S3, SQS, SNS)
```

## 🏗️ Recursos Criados

### S3
- Bucket `interview-ai-assets` para armazenar scripts, áudios, transcrições e relatórios
- Versionamento e encriptação configurados
- Event notification para trigger da Lambda `GenerateInterviewAudios`

### SQS
- Fila `interview-upload-queue` para processar uploads de áudio
- Configurada com long polling e retenção de 14 dias

### SNS
- Tópico `interview-transcription-events` para eventos de transcrição
- Subscription para Lambda `GenerateInterviewReport`

### IAM
- 7 IAM Roles (uma para cada Lambda)
- Políticas baseadas nos requisitos de cada Lambda

### Lambda Functions
- `GenerateInterviewAudios`: Gera áudios via ElevenLabs API
- `GenerateInterviewQuestions`: Gera perguntas via Bedrock Agent
- `GenerateInterviewReport`: Gera relatórios via Bedrock Agent
- `GeneratePresignedURL`: Gera URLs pré-assinadas para S3
- `GenerateUploadURLs`: Gera múltiplas URLs de upload
- `ProcessUploadQueue`: Processa fila SQS e aciona transcrições
- `TranscribeResponses`: Transcreve áudios usando AWS Transcribe

### Lambda Function URLs
- URLs HTTP para as Lambdas que precisam ser chamadas externamente
- CORS configurado

### Event Sources
- S3 → `GenerateInterviewAudios` (quando arquivo `roteiro-*.json` é criado)
- SQS → `ProcessUploadQueue` (quando mensagem chega na fila)
- SNS → `GenerateInterviewReport` (quando transcrições estão prontas)

## ⚙️ Variáveis Principais

Veja `variables.tf` para a lista completa. Principais:

- `aws_region`: Região AWS (default: us-east-1)
- `bucket_name`: Nome do bucket S3 (default: interview-ai-assets)
- `backend_bucket_name`: Bucket para state do Terraform (obrigatório)
- `elevenlabs_api_key`: API Key do ElevenLabs (sensitive, obrigatório)
- `bedrock_agent_id`: ID do Bedrock Agent para perguntas
- `bedrock_agent_alias_id`: ID do Bedrock Agent Alias para perguntas
- `bedrock_report_agent_id`: ID do Bedrock Agent para relatórios
- `bedrock_report_agent_alias_id`: ID do Bedrock Agent Alias para relatórios
- `backend_public_url`: URL pública do backend para callbacks (opcional)
- `lambda_function_names`: Mapa com nomes das Lambdas (pode ser customizado)

## 🔒 Segurança

- **Nunca commite** `terraform.tfvars` com valores reais
- Use AWS Secrets Manager ou Parameter Store para secrets em produção
- Habilite versionamento no bucket S3 do state
- Use DynamoDB para state locking
- Revise as políticas IAM regularmente
- Ajuste CORS nas Lambda Function URLs para domínios específicos em produção

## 🛠️ Comandos Úteis

```bash
# Validar configuração
terraform validate

# Formatar código
terraform fmt

# Ver plan sem aplicar
terraform plan

# Ver plan detalhado
terraform plan -out=tfplan
terraform show tfplan

# Aplicar mudanças
terraform apply

# Aplicar plan salvo
terraform apply tfplan

# Ver outputs
terraform output
terraform output lambda_function_urls

# Ver estado atual
terraform show

# Ver estado de um recurso específico
terraform state show aws_lambda_function.generate_interview_audios

# Listar todos os recursos
terraform state list

# Destruir toda a infraestrutura (CUIDADO!)
terraform destroy
```

## 🔄 Atualizar Código das Lambdas

Quando você atualizar o código Python das Lambdas:

1. Faça as alterações nos arquivos Python
2. Execute `terraform plan` - o Terraform detectará mudanças no `source_code_hash`
3. Execute `terraform apply` para atualizar as Lambdas

O Terraform automaticamente re-empacota o código quando detecta mudanças.

## 🐛 Troubleshooting

### Erro: "Bucket already exists"
O nome do bucket S3 deve ser único globalmente. Escolha outro nome em `terraform.tfvars`.

### Erro: "InvalidParameterValueException: The role defined for the function cannot be assumed by Lambda"
Verifique se as IAM Roles foram criadas corretamente. Execute `terraform apply` novamente.

### Erro: "ResourceConflictException: Function already exists"
Uma Lambda com esse nome já existe. Escolha outro nome ou destrua a existente primeiro.

### Erro ao criar archive_file
Certifique-se de que os arquivos Python existem nos caminhos corretos:
- `../GenerateInterview/lambda/GenerateInterviewAudios/main.py`
- `../GenerateInterview/lambda/GenerateInterviewQuestions/main.py`
- etc.

### Plan mostra mudanças mesmo sem alterar código
Isso pode acontecer se o código Python foi modificado. Execute `terraform apply` para atualizar.

## 📚 Próximos Passos Após Criação

1. ✅ Obter as URLs das Lambda Function URLs via `terraform output`
2. ✅ Configurar essas URLs no `application.properties` do backend
3. ✅ Testar o fluxo completo de entrevistas
4. ✅ Configurar CI/CD para usar Terraform (opcional)
5. ✅ Configurar monitoramento e alertas no CloudWatch

## 🔗 Integração com Backend

Após criar a infraestrutura, atualize o `application.properties` do backend com as URLs:

```properties
# Lambda URLs (obtenha via: terraform output)
lambda.url=https://<function-url-id>.lambda-url.us-east-1.on.aws/
lambda.presigned.url=https://<function-url-id>.lambda-url.us-east-1.on.aws/
lambda.upload.urls=https://<function-url-id>.lambda-url.us-east-1.on.aws/
```

## 📞 Suporte

Em caso de dúvidas:
- Consulte a [documentação do Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- Revise os logs: `terraform plan -detailed-exitcode`
- Verifique os logs das Lambdas no CloudWatch

## 🎯 Checklist de Setup

- [ ] Terraform >= 1.5 instalado
- [ ] AWS CLI configurado
- [ ] `terraform.tfvars` preenchido com valores corretos
- [ ] Backend S3 configurado (ou usando state local)
- [ ] `terraform init` executado
- [ ] `terraform validate` passou
- [ ] `terraform plan` revisado
- [ ] `terraform apply` executado com sucesso
- [ ] URLs das Lambdas obtidas via `terraform output`
- [ ] Backend configurado com as URLs
- [ ] Testes realizados

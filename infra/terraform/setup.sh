#!/bin/bash

# Script auxiliar para setup inicial da infraestrutura Terraform
# 
# Uso:
#   1. Configure terraform.tfvars com seus valores
#   2. Execute: ./setup.sh
#
# Este script ajuda a configurar o backend S3 e criar a infraestrutura

set -e

echo "🚀 Setup da Infraestrutura ViewIn com Terraform"
echo ""

# Verificar se terraform está instalado
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform não está instalado. Por favor, instale o Terraform primeiro."
    echo "   https://www.terraform.io/downloads"
    exit 1
fi

# Verificar se terraform.tfvars existe
if [ ! -f "terraform.tfvars" ]; then
    echo "⚠️  Arquivo terraform.tfvars não encontrado!"
    echo "   Copiando terraform.tfvars.example para terraform.tfvars..."
    cp terraform.tfvars.example terraform.tfvars
    echo "   ✅ Arquivo criado. Por favor, edite terraform.tfvars com seus valores e execute novamente."
    exit 1
fi

# Verificar se backend está configurado
if grep -q "# terraform {" backend.tf 2>/dev/null || [ ! -f "backend.tf" ]; then
    echo "📦 Configurando Backend S3..."
    echo ""
    echo "Para usar backend S3 (recomendado), você precisa:"
    echo "1. Criar um bucket S3 para o state"
    echo "2. Criar uma tabela DynamoDB para state locking"
    echo "3. Editar backend.tf e descomentar/configurar o backend"
    echo ""
    read -p "Deseja configurar o backend agora? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Nome do bucket S3 para state: " BACKEND_BUCKET
        read -p "Nome da tabela DynamoDB para locking: " LOCK_TABLE
        read -p "Região AWS (default: us-east-1): " REGION
        REGION=${REGION:-us-east-1}
        
        echo ""
        echo "Criando bucket S3..."
        aws s3 mb "s3://${BACKEND_BUCKET}" --region "${REGION}" || echo "Bucket pode já existir"
        
        echo "Criando tabela DynamoDB..."
        aws dynamodb create-table \
            --table-name "${LOCK_TABLE}" \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --billing-mode PAY_PER_REQUEST \
            --region "${REGION}" 2>/dev/null || echo "Tabela pode já existir"
        
        echo ""
        echo "✅ Recursos criados. Agora edite backend.tf e configure:"
        echo "   bucket = \"${BACKEND_BUCKET}\""
        echo "   dynamodb_table = \"${LOCK_TABLE}\""
        echo "   region = \"${REGION}\""
    fi
fi

# Inicializar Terraform
echo ""
echo "📥 Inicializando Terraform..."
terraform init

# Validar configuração
echo ""
echo "✅ Validando configuração..."
if ! terraform validate; then
    echo "❌ Validação falhou. Corrija os erros antes de continuar."
    exit 1
fi

# Formatar código
echo ""
echo "🎨 Formatando código..."
terraform fmt

# Mostrar plan
echo ""
echo "📋 Gerando plan de execução..."
echo "   (Isso pode levar alguns segundos...)"
terraform plan

echo ""
echo "✅ Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Revise o plan acima"
echo "   2. Se estiver tudo correto, execute: terraform apply"
echo "   3. Após aplicar, obtenha as URLs: terraform output"
echo ""
echo "💡 Dica: Use 'terraform plan -out=tfplan' para salvar o plan e"
echo "   depois 'terraform apply tfplan' para aplicar com segurança."


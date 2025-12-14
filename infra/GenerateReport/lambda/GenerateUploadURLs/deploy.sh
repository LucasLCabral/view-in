#!/bin/bash

# Script para deploy da Lambda GenerateUploadURLs
# Copia main_sqs.py para lambda_function.py e faz o deploy

set -e

echo "📦 Preparando deploy da Lambda GenerateUploadURLs..."

# Copia o arquivo correto
cp main_sqs.py lambda_function.py

# Cria zip
echo "🗜️  Criando pacote ZIP..."
zip -j function.zip lambda_function.py

# Faz deploy
echo "🚀 Fazendo deploy..."
aws lambda update-function-code \
    --function-name GenerateUploadURLs \
    --zip-file fileb://function.zip

# Aguarda atualização
echo "⏳ Aguardando atualização..."
aws lambda wait function-updated \
    --function-name GenerateUploadURLs

# Limpa arquivos temporários
rm function.zip lambda_function.py

echo "✅ Deploy concluído!"


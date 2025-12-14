#!/bin/bash

# Script para fazer deploy da Lambda GenerateInterviewReport com dependências

set -e

FUNCTION_NAME="GenerateInterviewReport"

echo "📦 Preparando deploy da Lambda $FUNCTION_NAME..."

# Cria diretório temporário para o pacote
rm -rf package
mkdir -p package

# Instala dependências
echo "📥 Instalando dependências..."
pip3 install --target ./package requests

# Copia arquivos da Lambda
echo "📄 Copiando arquivos..."
cp main.py package/lambda_function.py
cp agent_prompt.txt package/

# Cria zip
echo "🗜️  Criando pacote ZIP..."
cd package
zip -r ../function.zip .
cd ..

# Faz deploy
echo "🚀 Fazendo deploy..."
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://function.zip \
    --profile pessoal

# Aguarda atualização
echo "⏳ Aguardando atualização..."
aws lambda wait function-updated \
    --function-name $FUNCTION_NAME \
    --profile pessoal

# Limpa arquivos temporários
echo "🧹 Limpando..."
rm -rf package function.zip

echo ""
echo "✅ Deploy concluído!"


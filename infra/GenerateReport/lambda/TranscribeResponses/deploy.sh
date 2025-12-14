#!/bin/bash

FUNCTION_NAME="TranscribeResponses"

echo "📦 Deploy da Lambda $FUNCTION_NAME"

cd /Users/lucascabral/Projects/viewin/infra/GenerateReport/lambda/TranscribeResponses

# Cria zip
zip -j function.zip main.py

# Atualiza código
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://function.zip \
    --profile pessoal

# Limpa
rm function.zip

echo "✅ Deploy concluído!"


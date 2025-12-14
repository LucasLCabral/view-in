#!/bin/bash

# Script para atualizar a URL do Ngrok no frontend
# Uso: ./update-ngrok-url.sh

NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Erro: Não foi possível obter a URL do Ngrok"
    echo "   Certifique-se de que o Ngrok está rodando em http://localhost:4040"
    exit 1
fi

echo "✅ URL do Ngrok encontrada: $NGROK_URL"

FRONTEND_ENV_FILE=".env.local"

# Cria ou atualiza o arquivo .env.local
cat > "$FRONTEND_ENV_FILE" << EOF
# URLs atualizadas automaticamente pelo script update-ngrok-url.sh
VITE_API_GATEWAY_URL=$NGROK_URL
VITE_NGROK_URL=$NGROK_URL
EOF

echo "✅ Arquivo $FRONTEND_ENV_FILE atualizado com sucesso!"
echo ""
echo "⚠️  IMPORTANTE: Reinicie o servidor do frontend para aplicar as mudanças:"
echo "   cd viewin-frontend && npm run dev"


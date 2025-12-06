#!/bin/bash

echo "🚀 Starting Qwen Code Web UI"
echo ""
echo "📍 URLs:"
echo "   • Client: http://localhost:5173"
echo "   • Server: http://localhost:3000"
echo ""
echo "💡 Open http://localhost:5173 in your browser"
echo ""
echo "Press Ctrl+C to stop"
echo ""

export OPENAI_BASE_URL="http://10.0.0.82:8080/v1"
export OPENAI_API_KEY="FREE"
export OPENAI_MODEL="gpt3.5-turbo"

cd "$(dirname "$0")"
#OPENAI_BASE_URL="https://api.openai.com/v1" OPENAI_MODEL="gpt-4" npm run web-ui:dev

OPENAI_BASE_URL="http://10.0.0.82:8080/v1" OPENAI_API_KEY="FREE" OPENAI_MODEL="gpt3.5-turbo" npm run web-ui:dev

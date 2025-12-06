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


cd "$(dirname "$0")"

npm run web-ui:dev

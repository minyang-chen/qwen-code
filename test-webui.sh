#!/bin/bash

echo "=== Testing Qwen Code Web UI ==="
echo ""

# Check if dependencies are installed
echo "1. Checking dependencies..."
if [ ! -d "node_modules/fastify" ]; then
    echo "❌ Server dependencies missing"
    echo "   Run: npm install"
    exit 1
fi

if [ ! -d "node_modules/react" ]; then
    echo "❌ Client dependencies missing"
    echo "   Run: npm install"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check if ports are available
echo "2. Checking ports..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 already in use"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5173 already in use"
fi
echo ""

# Try to start the services
echo "3. Starting Web UI..."
echo "   Server: http://localhost:3000"
echo "   Client: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run web-ui:dev

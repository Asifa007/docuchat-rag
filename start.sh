#!/bin/bash
# DocuChat — Quick Start Script
# Run this from the project root after completing setup

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     DocuChat — Offline AI Chatbot    ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check Ollama
if ! command -v ollama &> /dev/null; then
  echo "❌ Ollama not found. Install from https://ollama.com"
  exit 1
fi

echo "✅ Ollama found"

# Start Ollama if not running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo "🚀 Starting Ollama server..."
  ollama serve &
  sleep 3
fi

# Pull models if missing
echo "📦 Checking models..."
ollama pull llama3 --quiet
ollama pull nomic-embed-text --quiet
echo "✅ Models ready"

# Start Backend
echo "🔧 Starting FastAPI backend..."
cd backend
source venv/bin/activate 2>/dev/null || python -m venv venv && source venv/bin/activate
pip install -r requirements.txt -q
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "🎨 Starting React frontend..."
cd frontend
npm install -q
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  🌐 Frontend: http://localhost:5173  ║"
echo "║  🔧 Backend:  http://localhost:8000  ║"
echo "║  📚 API Docs: http://localhost:8000/docs ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopped.'" SIGINT
wait

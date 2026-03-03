# 🧠 DocuChat — Offline AI Document Intelligence Platform

> **Chat with any PDF. 100% offline. Zero cost. Zero hallucinations.**  
> Powered by Ollama · LLaMA 3 · nomic-embed-text · FAISS · FastAPI · React

![DocuChat Banner](https://img.shields.io/badge/AI-Offline%20RAG-6c63ff?style=for-the-badge&logo=brain&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-00d4aa?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![FAISS](https://img.shields.io/badge/FAISS-Vector%20DB-ff6b6b?style=for-the-badge)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DocuChat Platform                         │
│                                                                  │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────────┐  │
│  │  React +   │    │   FastAPI    │    │      Ollama        │  │
│  │  Vite UI   │───▶│   Backend    │───▶│  ┌─────────────┐  │  │
│  │            │    │              │    │  │   llama3    │  │  │
│  │  - Upload  │    │  - /upload   │    │  │  (LLM Chat) │  │  │
│  │  - Chat    │    │  - /query    │    │  └─────────────┘  │  │
│  │  - Status  │    │  - /status   │    │  ┌─────────────┐  │  │
│  └────────────┘    │  - /clear    │    │  │nomic-embed  │  │  │
│                    └──────┬───────┘    │  │  (Vectors)  │  │  │
│                           │           │  └─────────────┘  │  │
│                    ┌──────▼───────┐   └────────────────────┘  │
│                    │    FAISS     │                             │
│                    │ Vector Store │                             │
│                    │ (In-Memory)  │                             │
│                    └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### RAG Pipeline Flow

```
PDF Upload
    │
    ▼
Text Extraction (pypdf)
    │
    ▼
Smart Chunking (600 chars, 100 overlap)
    │
    ▼
Embedding Generation (nomic-embed-text via Ollama)
    │
    ▼
FAISS Index (L2-normalized cosine similarity)
    │
   [Ready for queries]
    │
User Question
    │
    ▼
Question → Embedding
    │
    ▼
FAISS Top-K Search (k=5)
    │
    ▼
Context Assembly
    │
    ▼
Strict Prompt → LLaMA 3
    │
    ▼
Answer (strictly from document)
```

---

## 📁 Project Structure

```
docuchat/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app, routes, CORS
│   │   ├── embeddings.py    # Ollama nomic-embed-text wrapper
│   │   ├── vector_store.py  # FAISS index management
│   │   └── rag.py           # PDF extraction, chunking, LLM query
│   ├── uploads/             # Temporary PDF storage (auto-created)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx   # Animated hero + features + arch diagram
│   │   │   ├── Sidebar.jsx       # Status, doc info, stats
│   │   │   ├── UploadPanel.jsx   # Drag-drop upload with progress
│   │   │   ├── ChatArea.jsx      # Full chat UI with input
│   │   │   └── MessageBubble.jsx # User/AI message with source citations
│   │   ├── hooks/
│   │   │   └── useStatus.js      # Polls /status endpoint
│   │   ├── utils/
│   │   │   └── api.js            # Axios API calls
│   │   ├── App.jsx               # Root component + state machine
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Prerequisites

- **Python 3.11+**
- **Node.js 18+** and npm
- **[Ollama](https://ollama.com)** installed

---

## ⚙️ Setup Instructions

### Step 1 — Install Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: Download installer from https://ollama.com/download
```

### Step 2 — Pull Required Models

```bash
# Pull LLaMA 3 (chat model) — ~4.7GB
ollama pull llama3

# Pull nomic-embed-text (embedding model) — ~274MB
ollama pull nomic-embed-text

# Verify both are available
ollama list
```

### Step 3 — Start Ollama Server

```bash
ollama serve
# Runs on http://localhost:11434
```

> 💡 On macOS, Ollama runs as a background service automatically after installation.

---

### Step 4 — Set Up Backend

```bash
cd docuchat/backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate       # Linux/macOS
# OR
.\venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt
```

### Step 5 — Run Backend

```bash
# From docuchat/backend/
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API docs: `http://localhost:8000/docs`

---

### Step 6 — Set Up Frontend

```bash
cd docuchat/frontend

# Install dependencies
npm install
```

### Step 7 — Run Frontend

```bash
npm run dev
# Runs on http://localhost:5173
```

---

## 🌐 Open the App

Visit: **http://localhost:5173**

1. Watch for the **"Ollama Connected"** status indicator
2. Click **"Start Chatting"** on the landing page
3. **Drag-and-drop** (or click to browse) your PDF
4. Wait for indexing (~5–30 seconds depending on document size)
5. **Ask questions** — answers come only from your document!

---

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:8000/

# Check status
curl http://localhost:8000/status

# Upload a PDF
curl -X POST http://localhost:8000/upload \
  -F "file=@/path/to/your/document.pdf"

# Query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this document about?"}'

# Clear
curl -X DELETE http://localhost:8000/clear
```

---

## 🌍 Expose with ngrok (Optional)

Share your local instance publicly:

```bash
# Install ngrok: https://ngrok.com/download
# Then:
ngrok http 5173

# For backend separately:
ngrok http 8000
```

Update `VITE_API_URL` in frontend or the Vite proxy config with your ngrok URL.

---

## 🔧 Configuration

### Switch LLM Model (Backend)

Edit `backend/app/rag.py`:

```python
LLM_MODEL = "mistral"    # or "llama3", "llama3.1", "gemma2"
```

Available models: `ollama list`

### Adjust Chunk Size

```python
CHUNK_SIZE = 600    # Characters per chunk
CHUNK_OVERLAP = 100 # Overlap between chunks
TOP_K_CHUNKS = 5    # Chunks retrieved per query
```

### Change Embedding Model

```python
EMBED_MODEL = "nomic-embed-text"  # in embeddings.py
```

---

## 🎯 Features

| Feature | Status |
|--------|--------|
| PDF text extraction | ✅ |
| Overlapping chunk strategy | ✅ |
| Ollama nomic-embed-text embeddings | ✅ |
| FAISS cosine similarity search | ✅ |
| Anti-hallucination system prompt | ✅ |
| Fallback message for missing context | ✅ |
| Drag-and-drop upload | ✅ |
| Upload progress bar | ✅ |
| Real-time Ollama status indicator | ✅ |
| Typing indicator animation | ✅ |
| Source citations per answer | ✅ |
| Character counter for input | ✅ |
| Mobile-responsive design | ✅ |
| Dark glassmorphism UI | ✅ |
| Animated landing page | ✅ |
| Architecture diagram | ✅ |
| Clear & reset session | ✅ |
| Auto-scroll chat | ✅ |

---

## 🔐 Privacy

- ✅ No data sent to any cloud service
- ✅ No internet required after model download
- ✅ PDFs stored locally in `backend/uploads/`
- ✅ Vectors stored in RAM (cleared on reset)
- ✅ All inference runs on your own hardware

---

## 📊 Performance Tips

- Use **llama3** for best accuracy; **mistral** for speed
- Smaller PDFs (< 50 pages) process in under 30 seconds
- For large documents (100+ pages): expect 2–5 minutes for embedding
- Runs well on M1/M2 Mac, modern CPU, or NVIDIA GPU
- GPU acceleration: Ollama auto-detects CUDA/Metal

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | Ollama + LLaMA 3 |
| Embeddings | Ollama + nomic-embed-text |
| Vector DB | FAISS (Facebook AI) |
| Backend | FastAPI + Python |
| PDF Parsing | pypdf |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Icons | Lucide React |
| Fonts | Syne + DM Sans + JetBrains Mono |

---

## 🐛 Troubleshooting

**"Ollama not connected"**
```bash
ollama serve  # Start the server
ollama list   # Verify models are pulled
```

**"Model not found" error**
```bash
ollama pull llama3
ollama pull nomic-embed-text
```

**Slow embedding generation**
- Normal for first run (model loading)
- Subsequent queries are faster
- GPU significantly speeds this up

**PDF has no extractable text**
- PDF may be a scanned image
- Use OCR tool first (e.g., Adobe Acrobat, tesseract)

**CORS errors in browser**
- Ensure backend is running on port 8000
- Vite proxy is configured in `vite.config.js`

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙌 Built With

- [Ollama](https://ollama.com) — local LLM runtime
- [FAISS](https://github.com/facebookresearch/faiss) — vector similarity search
- [FastAPI](https://fastapi.tiangolo.com) — modern Python API framework
- [React](https://react.dev) — frontend library
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling

---

*Made with ❤️ for the AI/ML community. 100% local, 100% free, 100% yours.*

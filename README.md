# DocuChat — Offline Document Intelligence Platform

> A privacy-focused AI system that enables semantic search and question answering over PDF documents using a locally deployed RAG architecture.
> Built with FastAPI · FAISS · Local LLM · React · Tailwind CSS

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DocuChat Platform                        │
│                                                                 │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────────┐  │
│  │  React +   │    │   FastAPI    │    │   Local AI Engine  │  │
│  │  Vite UI   │───▶│   Backend    │───▶│                   │  │
│  │            │    │              │    │  ┌─────────────┐   │  │
│  │  - Upload  │    │  - /upload   │    │  │   LLM Chat  │   │  │
│  │  - Chat    │    │  - /query    │    │  └─────────────┘   │  │
│  │  - Status  │    │  - /status   │    │  ┌─────────────┐   │  │
│  └────────────┘    │  - /clear    │    │  │ Embeddings  │   │  │
│                    └──────┬───────┘    │  └─────────────┘   │  │
│                           │            └────────────────────┘  │
│                    ┌──────▼───────┐                             │
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
Embedding Generation (Local embedding model)
    │
    ▼
FAISS Index (Cosine similarity search)
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
Strict Prompt → Local LLM
    │
    ▼
Answer (strictly from document context)
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

---

## ⚙️ Setup Instructions
Step 1 — Clone the Repository
```
git clone https://github.com/your-username/docuchat.git
cd docuchat
```
Step 2 — Set Up Backend

```
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate       # Linux/macOS
# OR
.\venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt
```
Step 3 — Run Backend
```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Backend API docs available at:

http://localhost:8000/docs
```
Step 4 — Set Up Frontend
```
cd ../frontend

# Install dependencies
npm install
```
Step 5 — Run Frontend
```
npm run dev
```
Frontend runs on:
```
http://localhost:5173
```
## 🌐 Open the App

Visit:
```
http://localhost:5173
```
Ensure backend is running on port 8000

Click "Start Chatting"

Upload a PDF (drag-and-drop supported)

Wait for document indexing

Ask questions — responses are generated strictly from retrieved document context

## 🧪 Testing the API
```
# Health check
curl http://localhost:8000/

# Check system status
curl http://localhost:8000/status

# Upload a PDF
curl -X POST http://localhost:8000/upload \
  -F "file=@/path/to/your/document.pdf"

# Query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this document about?"}'

# Clear session
curl -X DELETE http://localhost:8000/clear
```
## 🌍 Expose with ngrok (Optional)
```
ngrok http 5173
ngrok http 8000
```
Update VITE_API_URL in the frontend if exposing backend publicly.

## 🔧 Configuration

Change Retrieval Parameters

Edit backend/app/rag.py:
```
CHUNK_SIZE = 600
CHUNK_OVERLAP = 100
TOP_K_CHUNKS = 5
Change LLM Model (If Using Local Model)
LLM_MODEL = "your-local-model-name"
Change Embedding Model
EMBED_MODEL = "your-embedding-model-name"
```
## 🎯 Features

| Feature | Status |
|----------|----------|
| PDF text extraction | ✅ |
| Overlapping chunk strategy | ✅ |
| Local embedding generation | ✅ |
| FAISS cosine similarity search | ✅ |
| Grounded (anti-hallucination) prompt system | ✅ |
| Fallback response for insufficient context | ✅ |
| Drag-and-drop upload | ✅ |
| Upload progress bar | ✅ |
| Real-time backend status indicator | ✅ |
| Typing indicator animation | ✅ |
| Source citations per answer | ✅ |
| Character counter for input | ✅ |
| Mobile-responsive design | ✅ |
| Modern glassmorphism UI | ✅ |
| Animated landing page | ✅ |
| System architecture diagram | ✅ |
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

- Smaller PDFs (< 50 pages) typically index in under 30 seconds (CPU-based inference)
- Larger documents (100+ pages) may take 2–5 minutes for embedding generation
- First query may be slower due to model initialization
- Subsequent queries are significantly faster due to cached index
- GPU acceleration (if supported by your local model) improves embedding and inference speed

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | Local LLM inference |
| Embeddings | Local embedding model |
| Vector DB | FAISS |
| Backend | FastAPI + Python |
| PDF Parsing | pypdf |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Icons | Lucide React |
| Fonts | Syne + DM Sans + JetBrains Mono |

---

## 🐛 Troubleshooting

Backend not running
```
uvicorn app.main:app --reload --port 8000
```
Ensure the backend is accessible at:
```
http://localhost:8000
```
- PDF has no extractable text
- The document may be scanned (image-based)
- Use an OCR tool before uploading
- Slow indexing
- Large PDFs generate more chunks and embeddings
- CPU-based systems may take longer
- Reduce CHUNK_SIZE if needed

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👩‍💻 Author

Built by **Asifa Firdhouse**

---


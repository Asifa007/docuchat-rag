"""
DocuChat - Offline AI Document Chatbot
FastAPI Backend Entry Point
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import shutil
import uuid
import logging

from app.rag import RAGPipeline
from app.embeddings import OllamaEmbedder
from app.vector_store import FAISSVectorStore

# ─── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ─── App Init ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="DocuChat API",
    description="Offline AI Document Chatbot using Ollama + FAISS RAG",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global State ──────────────────────────────────────────────────────────────
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Singleton instances
embedder = OllamaEmbedder()
vector_store = FAISSVectorStore()
rag = RAGPipeline(embedder=embedder, vector_store=vector_store)

# Track current document
current_document: dict = {}


# ─── Request/Response Models ───────────────────────────────────────────────────
class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str
    sources: list[str]
    document_name: str


class StatusResponse(BaseModel):
    ollama_connected: bool
    document_loaded: bool
    document_name: str
    chunk_count: int


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {"status": "DocuChat API is running", "version": "1.0.0"}


@app.get("/status", response_model=StatusResponse, tags=["Status"])
async def get_status():
    """
    Returns the current system status:
    - Ollama connectivity
    - Document load state
    """
    ollama_ok = embedder.check_connection()
    return StatusResponse(
        ollama_connected=ollama_ok,
        document_loaded=vector_store.is_ready(),
        document_name=current_document.get("name", ""),
        chunk_count=vector_store.chunk_count(),
    )


@app.post("/upload", tags=["Document"])
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF, extract text, chunk it, embed it, and store in FAISS.
    Supports: .pdf files only.
    """
    global current_document

    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Save file to disk
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Saved PDF: {file.filename} → {file_path}")

        # Process: extract → chunk → embed → store
        chunk_count = rag.process_document(file_path)

        current_document = {
            "id": file_id,
            "name": file.filename,
            "path": file_path,
            "chunks": chunk_count,
        }

        logger.info(f"Document processed: {chunk_count} chunks indexed.")
        return {
            "success": True,
            "message": f"Document '{file.filename}' processed successfully.",
            "chunks": chunk_count,
            "document_name": file.filename,
        }

    except Exception as e:
        # Clean up on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.post("/query", response_model=QueryResponse, tags=["Chat"])
async def query_document(request: QueryRequest):
    """
    Answer a question using RAG over the uploaded document.
    Strictly answers only from document context — no hallucination.
    """
    if not vector_store.is_ready():
        raise HTTPException(
            status_code=400,
            detail="No document loaded. Please upload a PDF first."
        )

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        answer, sources = rag.query(request.question)
        return QueryResponse(
            answer=answer,
            sources=sources,
            document_name=current_document.get("name", "Unknown"),
        )
    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@app.delete("/clear", tags=["Document"])
async def clear_document():
    """Clear the current document and reset the vector store."""
    global current_document

    vector_store.clear()
    current_document = {}

    # Clean up uploaded files
    for f in os.listdir(UPLOAD_DIR):
        os.remove(os.path.join(UPLOAD_DIR, f))

    return {"success": True, "message": "Document cleared. Ready for new upload."}

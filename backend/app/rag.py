"""
rag.py
RAG (Retrieval-Augmented Generation) Pipeline.

Flow:
PDF → Text Extraction → Chunking → Embedding → FAISS
Query → Embed → FAISS Search → Context → HuggingFace LLM → Answer
"""

import os
import logging
import re
import requests
from typing import List, Tuple
from dotenv import load_dotenv
from pypdf import PdfReader

from app.embeddings import OllamaEmbedder
from app.vector_store import FAISSVectorStore

load_dotenv()
logger = logging.getLogger(__name__)

# ----------------------------
# CONFIG
# ----------------------------

CHUNK_SIZE = 600
CHUNK_OVERLAP = 100
TOP_K_CHUNKS = 5

SYSTEM_PROMPT = """You are a helpful document assistant.

Rules:
1. Use ONLY the provided context.
2. Do NOT use external knowledge.
3. If the user asks a vague question (like "projects"), interpret it intelligently.
4. If the answer truly does not exist in the context, respond:
   "The answer is not available in the document."
5. Be clear, structured, and concise.
"""


class RAGPipeline:

    def __init__(self, embedder: OllamaEmbedder, vector_store: FAISSVectorStore):
        self.embedder = embedder
        self.vector_store = vector_store

    # =========================
    # DOCUMENT PROCESSING
    # =========================

    def extract_text(self, pdf_path: str) -> str:
        reader = PdfReader(pdf_path)
        pages_text = []

        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text.strip())

        return "\n\n".join(pages_text)

    def chunk_text(self, text: str) -> List[str]:
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)

        chunks = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = min(start + CHUNK_SIZE, text_len)
            chunk = text[start:end].strip()

            if len(chunk) > 50:
                chunks.append(chunk)

            start = end - CHUNK_OVERLAP if end < text_len else text_len

        return chunks

    def process_document(self, pdf_path: str) -> int:
        text = self.extract_text(pdf_path)

        if not text.strip():
            raise ValueError("PDF has no extractable text.")

        chunks = self.chunk_text(text)

        logger.info(f"Generating embeddings for {len(chunks)} chunks...")
        embeddings = self.embedder.embed_batch(chunks)

        self.vector_store.clear()
        self.vector_store.build(embeddings, chunks)

        return len(chunks)

    # =========================
    # QUERY
    # =========================

    def query(self, question: str) -> Tuple[str, List[str]]:

        logger.info(f"Processing query: {question}")

        query_embedding = self.embedder.embed(question)
        results = self.vector_store.search(query_embedding, top_k=TOP_K_CHUNKS)

        if not results:
            return "The answer is not available in the document.", []

        context_parts = [chunk for chunk, score in results]
        context = "\n\n---\n\n".join(context_parts)
        source_previews = [chunk[:120] + "..." for chunk in context_parts]

        full_prompt = f"""
CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""

        answer = self._call_llm(full_prompt)

        return answer, source_previews

    # =========================
    # HUGGINGFACE LLM CALL
    # =========================

    def _call_llm(self, prompt: str) -> str:

        HF_TOKEN = os.getenv("HF_TOKEN")
        if not HF_TOKEN:
            raise RuntimeError("HF_TOKEN not found in .env file")

        API_URL = "https://router.huggingface.co/v1/chat/completions"

        headers = {
            "Authorization": f"Bearer {HF_TOKEN}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "meta-llama/Meta-Llama-3-8B-Instruct",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.1,
            "max_tokens": 512,
        }

        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)

        if response.status_code != 200:
            raise RuntimeError(f"HuggingFace API error: {response.text}")

        result = response.json()

        return result["choices"][0]["message"]["content"].strip()
"""
vector_store.py
FAISS-based vector store for storing and retrieving document chunk embeddings.
Supports cosine similarity search via L2-normalized inner product.
"""

import faiss
import numpy as np
import logging
from typing import List, Tuple

logger = logging.getLogger(__name__)


class FAISSVectorStore:

    def __init__(self):
        self.index: faiss.IndexFlatIP | None = None
        self.chunks: List[str] = []
        self.dimension: int | None = None

    def build(self, embeddings, chunks: List[str]) -> None:
        """
        Build (or rebuild) the FAISS index.
        """

        # Convert to numpy array immediately
        vectors = np.array(embeddings, dtype=np.float32)

        if vectors.shape[0] != len(chunks):
            raise ValueError(
                f"Mismatch: {vectors.shape[0]} embeddings vs {len(chunks)} chunks."
            )

        if vectors.shape[0] == 0:
            raise ValueError("No embeddings provided — document may be empty.")

        self.dimension = vectors.shape[1]
        self.chunks = chunks

        # Normalize for cosine similarity
        faiss.normalize_L2(vectors)

        # Build FAISS index
        self.index = faiss.IndexFlatIP(self.dimension)
        self.index.add(vectors)

        logger.info(f"FAISS index built: {self.index.ntotal} vectors, dim={self.dimension}")

    def search(self, query_embedding, top_k: int = 5) -> List[Tuple[str, float]]:

        if self.index is None or self.index.ntotal == 0:
            raise RuntimeError("Vector store is empty. Upload a document first.")

        query_vec = np.array([query_embedding], dtype=np.float32)
        faiss.normalize_L2(query_vec)

        actual_k = min(top_k, len(self.chunks))

        scores, indices = self.index.search(query_vec, actual_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1 and idx < len(self.chunks):
                results.append((self.chunks[idx], float(score)))

        logger.info(f"Retrieved {len(results)} chunks for query (top-{actual_k})")
        return results

    def is_ready(self) -> bool:
        return self.index is not None and self.index.ntotal > 0

    def chunk_count(self) -> int:
        if self.index is None:
            return 0
        return self.index.ntotal

    def clear(self) -> None:
        self.index = None
        self.chunks = []
        self.dimension = None
        logger.info("Vector store cleared.")
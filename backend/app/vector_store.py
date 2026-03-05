"""
vector_store.py
ChromaDB-based vector store for storing and retrieving document chunk embeddings.
"""

import chromadb
import logging
from typing import List, Tuple

logger = logging.getLogger(__name__)


class FAISSVectorStore:

    def __init__(self):
        self.client = chromadb.Client()
        self.collection = self.client.create_collection("documents")
        self.chunks: List[str] = []

    def build(self, embeddings, chunks: List[str]) -> None:
        """
        Build the Chroma vector store.
        """

        if len(embeddings) != len(chunks):
            raise ValueError(
                f"Mismatch: {len(embeddings)} embeddings vs {len(chunks)} chunks."
            )

        if len(embeddings) == 0:
            raise ValueError("No embeddings provided — document may be empty.")

        self.chunks = chunks

        ids = [str(i) for i in range(len(chunks))]

        self.collection.add(
            embeddings=embeddings,
            documents=chunks,
            ids=ids
        )

        logger.info(f"ChromaDB index built with {len(chunks)} vectors")

    def search(self, query_embedding, top_k: int = 5) -> List[Tuple[str, float]]:

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        docs = results["documents"][0]
        scores = results["distances"][0]

        retrieved = []
        for doc, score in zip(docs, scores):
            retrieved.append((doc, float(score)))

        logger.info(f"Retrieved {len(retrieved)} chunks for query")
        return retrieved

    def is_ready(self) -> bool:
        return len(self.chunks) > 0

    def chunk_count(self) -> int:
        return len(self.chunks)

    def clear(self) -> None:
        self.client.delete_collection("documents")
        self.collection = self.client.create_collection("documents")
        self.chunks = []
        logger.info("Vector store cleared.")
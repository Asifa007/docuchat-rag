"""
embeddings.py
Lightweight embeddings using SentenceTransformers.
No Ollama. No heavy RAM usage.
"""

from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List


class OllamaEmbedder:
    """
    Replacement for Ollama embeddings.
    Uses lightweight 'all-MiniLM-L6-v2'.
    """

    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.dimension = 384  # known dimension for this model

    def embed(self, text: str) -> List[float]:
        embedding = self.model.encode(text)
        return np.array(embedding).astype("float32")

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts)
        return np.array(embeddings).astype("float32")

    def get_dimension(self) -> int:
        return self.dimension
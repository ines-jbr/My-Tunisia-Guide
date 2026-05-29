# uploader.py — Étape 6 : Stocker dans Qdrant
from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams, Distance, PointStruct
)
import uuid

COLLECTION_NAME = "tourism_docs"
VECTOR_SIZE     = 3072  # taille embedding Gemini

client = QdrantClient(host="localhost", port=6333)

def ensure_collection():
    """Crée la collection si elle n'existe pas."""
    collections = [
        c.name for c in client.get_collections().collections
    ]
    
    if COLLECTION_NAME not in collections:
        client.create_collection(
            collection_name = COLLECTION_NAME,
            vectors_config  = VectorParams(
                size     = VECTOR_SIZE,
                distance = Distance.COSINE
            )
        )
        print(f"✅ Collection '{COLLECTION_NAME}' créée")
    else:
        print(f"✅ Collection '{COLLECTION_NAME}' existe déjà")

def upload_chunks(chunks:      list[str],
                  embeddings:  list[list[float]],
                  source_file: str):
    """Upload les chunks et embeddings dans Qdrant."""
    
    points = []
    for chunk, emb in zip(chunks, embeddings):
        if emb:  # ignorer embeddings vides
            points.append(PointStruct(
                id      = str(uuid.uuid4()),
                vector  = emb,
                payload = {
                    "text":   chunk,
                    "source": source_file
                }
            ))
    
    if points:
        client.upsert(
            collection_name = COLLECTION_NAME,
            points          = points
        )
        print(f"  ✅ {len(points)} chunks uploadés")
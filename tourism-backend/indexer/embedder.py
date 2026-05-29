# embedder.py — Étape 5 : Générer les embeddings via Gemini
import requests
import time

GEMINI_API_KEY = "AIzaSyCoDaof8lh5oUE-dE-Oe2zPpVM2Bf7N7uw"  # même clé que appsettings.json
EMBED_MODEL    = "models/gemini-embedding-001"
EMBED_URL      = (
    f"https://generativelanguage.googleapis.com"
    f"/v1beta/{EMBED_MODEL}:embedContent"
    f"?key={GEMINI_API_KEY}"
)

def get_embedding(text: str) -> list[float]:
    """Génère un embedding pour un texte."""
    
    body = {
        "model":   EMBED_MODEL,
        "content": {
            "parts": [{"text": text[:2000]}]  # limite 2000 chars
        }
    }
    
    response = requests.post(EMBED_URL, json=body)
    
    if response.status_code == 200:
        return response.json()["embedding"]["values"]
    else:
        print(f"❌ Erreur embedding: {response.text}")
        return []

def get_embeddings_batch(chunks: list[str]) -> list[list[float]]:
    """Génère les embeddings pour tous les chunks."""
    embeddings = []
    
    for i, chunk in enumerate(chunks):
        print(f"  Embedding {i+1}/{len(chunks)}...", end="\r")
        emb = get_embedding(chunk)
        embeddings.append(emb)
        time.sleep(0.5)  # éviter rate limit
    
    print(f"  ✅ {len(embeddings)} embeddings générés")
    return embeddings
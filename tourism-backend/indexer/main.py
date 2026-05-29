# main.py — Pipeline complète
import os
from loader   import load_pdfs
from cleaner  import clean_text
from chunker  import chunk_text
from embedder import get_embeddings_batch
from uploader import ensure_collection, upload_chunks

# ── Chemin vers les PDFs
PDFS_FOLDER = r"C:\Users\MSI\Desktop\project\tourism-backend\TourismAPI\Data\pdfs"

def run_pipeline():
    print("🚀 Démarrage du pipeline d'indexation...\n")
    
    # Étape 1 & 2 : Charger les PDFs
    print("📂 ÉTAPE 1-2 : Chargement des PDFs...")
    documents = load_pdfs(PDFS_FOLDER)
    
    # Préparer Qdrant
    print("\n🗄️ Préparation Qdrant...")
    ensure_collection()
    
    total_chunks = 0
    
    for doc in documents:
        print(f"\n📄 Traitement : {doc['filename']}")
        
        # Étape 3 : Nettoyer
        cleaned = clean_text(doc["text"])
        print(f"  ✅ Nettoyé : {len(cleaned)} chars")
        
        # Étape 4 : Chunking
        chunks = chunk_text(cleaned)
        print(f"  ✅ Chunks  : {len(chunks)}")
        
        if not chunks:
            print("  ⚠️ Aucun chunk — PDF ignoré")
            continue
        
        # Étape 5 : Embeddings
        print(f"  🧠 Génération embeddings...")
        embeddings = get_embeddings_batch(chunks)
        
        # Étape 6 : Upload Qdrant
        print(f"  💾 Upload vers Qdrant...")
        upload_chunks(chunks, embeddings, doc["filename"])
        
        total_chunks += len(chunks)
    
    print(f"\n✅ Pipeline terminée !")
    print(f"📊 Total chunks indexés : {total_chunks}")

if __name__ == "__main__":
    run_pipeline()
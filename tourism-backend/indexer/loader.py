# loader.py — Étape 1 & 2 : Charger et extraire le texte des PDFs
import fitz  # PyMuPDF
import os

def load_pdfs(pdfs_folder: str) -> list[dict]:
    """Charge tous les PDFs et extrait leur texte."""
    documents = []
    
    for filename in os.listdir(pdfs_folder):
        if filename.endswith(".pdf"):
            pdf_path = os.path.join(pdfs_folder, filename)
            try:
                doc  = fitz.open(pdf_path)
                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()
                
                documents.append({
                    "filename": filename,
                    "text":     text.strip()
                })
                print(f"✅ Chargé : {filename} ({len(text)} chars)")
            except Exception as e:
                print(f"❌ Erreur {filename} : {e}")
    
    print(f"\n📚 Total : {len(documents)} PDFs chargés")
    return documents
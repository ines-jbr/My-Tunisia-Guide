# chunker.py — Étape 4 : Découper en chunks
def chunk_text(text: str,
               chunk_size: int  = 500,
               overlap:    int  = 50) -> list[str]:
    """Découpe le texte en chunks avec overlap."""
    
    words  = text.split()
    chunks = []
    i      = 0
    
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        if len(chunk.strip()) > 100:  # ignorer chunks trop courts
            chunks.append(chunk)
        i += chunk_size - overlap
    
    return chunks
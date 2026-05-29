# cleaner.py — Étape 3 : Nettoyer le texte
import re

def clean_text(text: str) -> str:
    """Nettoie le texte extrait des PDFs."""
    
    # Supprimer caractères spéciaux inutiles
    text = re.sub(r'\x00', '', text)
    
    # Normaliser les espaces multiples
    text = re.sub(r' +', ' ', text)
    
    # Normaliser les sauts de ligne multiples
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Supprimer les lignes trop courtes (headers/footers)
    lines = text.split('\n')
    lines = [l for l in lines if len(l.strip()) > 20]
    text  = '\n'.join(lines)
    
    return text.strip()
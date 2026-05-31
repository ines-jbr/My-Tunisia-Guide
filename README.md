# 🇹🇳 My Tunisia Guide — AI-Powered Tourism Assistant

> Système intelligent de recommandation touristique pour la Tunisie, combinant IA générative, recherche sémantique et cartographie interactive.

---

## 📸 Aperçu

My Tunisia Guide est une application web full-stack qui permet aux utilisateurs de poser des questions en langage naturel sur la Tunisie (hôtels, restaurants, sites touristiques, événements culturels...) et d'obtenir des réponses intelligentes accompagnées d'une carte interactive.

---

## ✨ Fonctionnalités

- 🤖 **Assistant IA** — Réponses intelligentes via Google Gemini
- 🗺️ **Carte interactive** — Visualisation ArcGIS des lieux recommandés
- 📚 **RAG Engine** — Recherche sémantique dans 12 documents PDF
- ⚡ **Cache Redis** — Réponses instantanées pour les questions fréquentes
- 🔐 **Authentification** — Inscription avec vérification email
- 💬 **Historique** — Conversations séparées par utilisateur
- 🎭 **Événements** — Base de données des festivals et événements tunisiens

---

## 🛠️ Stack Technologique

| Composant | Technologies |
|-----------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, ArcGIS Maps SDK JS |
| **Backend** | ASP.NET Core 8, C#, REST API |
| **LLM** | Google Gemini 3.5 Flash |
| **RAG Engine** | Qdrant, Gemini Embedding API |
| **Cache** | Redis, StackExchange.Redis |
| **Pipeline** | Python 3.12, PyMuPDF |
| **Email** | MailKit, Gmail SMTP |
| **Données** | CSV (3018 lieux), JSON culturel, 12 PDFs |

---

## 🏗️ Architecture

```
tourism-backend/
├── TourismAPI/                  # ASP.NET Core 8
│   ├── Controllers/
│   │   ├── ChatController.cs    # API Chat
│   │   └── AuthController.cs   # Authentification
│   ├── Services/
│   │   ├── OrchestratorService.cs  # Orchestration
│   │   ├── LlmService.cs           # Gemini API
│   │   ├── RagService.cs           # RAG Engine
│   │   ├── DataService.cs          # CSV + JSON
│   │   ├── GeoService.cs           # GeoJSON
│   │   ├── CacheService.cs         # Redis
│   │   ├── EmailService.cs         # Email
│   │   └── VerificationService.cs  # Codes vérification
│   ├── Models/
│   └── Data/
│       ├── 2026.csv                # 3018 lieux tunisiens
│       ├── cultural_knowledge.json # Contexte culturel
│       ├── events_data.json        # Événements
│       └── pdfs/                   # 12 articles PDF
│
├── indexer/                     # Pipeline Python
│   ├── main.py
│   ├── loader.py
│   ├── cleaner.py
│   ├── chunker.py
│   ├── embedder.py
│   └── uploader.py
│
tourism-frontend/
├── src/
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── ChatInput.jsx
│   │   ├── Map/
│   │   │   └── MapPanel.jsx
│   │   └── Layout/
│   │       ├── Sidebar.jsx
│   │       └── Header.jsx
│   ├── hooks/
│   │   └── useChat.js
│   ├── services/
│   │   └── api.js
│   └── Auth/
│       ├── Login.jsx
│       └── Register.jsx
```

---

## 🚀 Installation et lancement

### Prérequis
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org)
- [Python 3.12](https://python.org)
- [Qdrant](https://qdrant.tech/documentation/quick-start/)
- [Redis](https://redis.io/download)

---

### 1️⃣ Backend (.NET)

```bash
cd tourism-backend/TourismAPI

# Installer les packages
dotnet restore

# Configurer appsettings.json
# → Ajouter clé Gemini API
# → Configurer Redis, Qdrant, Email

# Lancer
dotnet run
```

L'API sera disponible sur `http://localhost:5014`

---

### 2️⃣ Qdrant (Vector Database)

```bash
# Télécharger depuis https://github.com/qdrant/qdrant/releases
# Lancer l'exécutable
./qdrant.exe   # Windows
./qdrant       # Linux/Mac
```

Qdrant sera disponible sur `http://localhost:6333`

---

### 3️⃣ Pipeline d'indexation (Python)

```bash
cd tourism-backend/indexer

# Installer les dépendances
pip install pymupdf qdrant-client requests python-dotenv

# Configurer la clé API dans embedder.py
# Lancer l'indexation
python main.py
```

---

### 4️⃣ Frontend (React)

```bash
cd tourism-frontend

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

---

### 5️⃣ Redis

```bash
# Windows
redis-server

# Ou via le service Windows installé
```

---

## ⚙️ Configuration

Créer/modifier `tourism-backend/TourismAPI/appsettings.json` :

```json
{
  "Gemini": {
    "ApiKey": "VOTRE_CLE_GEMINI",
    "Model": "gemini-3.5-flash"
  },
  "Qdrant": {
    "Host": "localhost",
    "Port": 6334,
    "Collection": "tourism_docs"
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  },
  "Email": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "VOTRE_EMAIL@gmail.com",
    "Password": "VOTRE_MOT_DE_PASSE_APP",
    "From": "VOTRE_EMAIL@gmail.com"
  }
}
```

---

## 📊 Données

| Source | Contenu | Taille |
|--------|---------|--------|
| `2026.csv` | Hôtels, restaurants, sites... | 3018 lieux |
| `cultural_knowledge.json` | Gastronomie, traditions, musique | Toutes régions |
| `events_data.json` | Festivals, concerts, expositions | 2024-2027 |
| `pdfs/` | Articles touristiques | 12 documents |

---

## 🔄 Flux de traitement

```
Question utilisateur
      ↓
Cache Redis (vérification)
      ↓ miss
RAG Engine → Qdrant (5 chunks PDFs)
      ↓
Détection type + région
      ↓
Filtrage CSV (lieux pertinents)
      ↓
Contexte culturel JSON
      ↓
Google Gemini (génération réponse)
      ↓
GeoService (génération GeoJSON)
      ↓
Cache Redis (sauvegarde 1h)
      ↓
Réponse text + GeoJSON → Frontend
```

---

## 👥 Auteurs

Projet développé dans le cadre d'un projet académique.

---

## 📄 Licence

Ce projet est développé à des fins académiques.

---

*🇹🇳 Explorez • Découvrez • Vivez la Tunisie*

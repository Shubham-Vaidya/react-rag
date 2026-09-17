# 🍵 YouTube RAG Assistant — Chai aur React

> An end-to-end Retrieval-Augmented Generation (RAG) application that indexes Hitesh Choudhary's popular **"Chai aur React"** YouTube playlist. Ask natural language questions about React concepts and jump directly to the exact video timestamp.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-red?style=flat-square&logo=qdrant)](https://qdrant.tech/)
[![Groq](https://img.shields.io/badge/Groq-LLM_Inference-orange?style=flat-square)](https://groq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 📌 Problem Statement

When learning from long video playlists (30+ videos), revising specific concepts later can be frustrating. Searching through hours of footage just to find a 30-second explanation on `useState`, Virtual DOM, or `useEffect` cleanup routines wastes time.

**YouTube RAG Assistant** solves this by:
1. Transcribing the full video playlist into structured text with precise time boundaries.
2. Converting transcript chunks into high-dimensional vector embeddings stored in a vector database.
3. Synthesizing concise AI answers with direct, clickable YouTube timestamp references (`&t=XXs`).

---

## 🏗️ System Architecture
[ YouTube Playlist ]
│
▼ (yt-dlp)
[ Audio Files ]
│
▼ (OpenAI Whisper)
[ Timestamped Transcripts ]
│
▼ (Sentence Transformers: all-MiniLM-L6-v2)
[ 384-dim Vector Chunks ]
│
▼
(Qdrant Cloud DB) ◄──── Semantic Query ──── (Next.js App / Local Embedding)
│
▼
(Groq API: Llama 3)
│
▼
[ UI Output + Timestamp Links ]

---

## ✨ Features

- **Semantic Video Search**: Query concepts in plain English instead of relying on exact keyword matching.
- **Local Embedding Engine**: Uses `@xenova/transformers` inside Node.js to compute query vectors locally without relying on external embedding APIs.
- **Timestamp Precision**: Clickable video source cards jump directly to the precise second where the concept is discussed.
- **Modern Glassmorphism UI**: High-contrast, responsive interface built with Next.js and Tailwind CSS.
- **Model Fallback Handling**: Designed with resilient LLM routing over Groq Cloud.

---

## 🛠️ Tech Stack

### Ingestion & Data Pipeline
- **Language**: Python 3.10+
- **Audio Extraction**: `yt-dlp`
- **Speech-to-Text**: `openai-whisper`
- **Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2`)
- **Vector Database**: `qdrant-client`

### Web UI & API Gateway
- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Local Inference**: `@xenova/transformers` (ONNX runtime in Node.js)
- **Vector Store Client**: `@qdrant/js-client-rest`
- **LLM Engine**: `groq-sdk`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Python 3.10+](https://www.python.org/)
- [FFmpeg](https://ffmpeg.org/) (required for audio extraction via `yt-dlp` and `whisper`)
- A free [Qdrant Cloud Account](https://cloud.qdrant.io/)
- A free [Groq Cloud API Key](https://console.groq.com/)

---

### 📥 Installation & Setup

#### 1. Clone the Repository
```bash
git clone [https://github.com/Shubham-Vaidya/react-rag.git](https://github.com/Shubham-Vaidya/react-rag.git)
cd react-rag

2. Set Up Environment Variables
Create a .env file in the project root (and copy it inside web-ui/ as well):

Code snippet
QDRANT_URL=[https://your-qdrant-cluster-url.cloud.qdrant.io:6333](https://your-qdrant-cluster-url.cloud.qdrant.io:6333)
QDRANT_API_KEY=your_qdrant_api_key
GROQ_API_KEY=gsk_your_groq_api_key
🐍 Data Ingestion Pipeline (Python)
Create and activate a Python virtual environment:

Bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
Install ingestion dependencies:

Bash
pip install yt-dlp openai-whisper sentence-transformers qdrant-client python-dotenv
Run audio download and transcription:

Bash
cd ingestion
python audio.py
python transcribe.py
Generate embeddings and push vector data to Qdrant Cloud:

Bash
python push_to_qdrant.py
💻 Web Application (Next.js)
Navigate to the web-ui folder and install dependencies:

Bash
cd ../web-ui
npm install
Start the development server:

Bash
npm run dev
Open http://localhost:3000 in your browser to start querying the playlist!

📖 Sample Queries to Try
"What is Virtual DOM and how does reconciliation work?"

"How do I pass props between components?"

"How does the cleanup function in useEffect work?"

"What is useRef and when should I use it over useState?"

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

🙏 Acknowledgments
Hitesh Choudhary for creating the Chai aur React series.

Pratyush for inspiring video intelligence and transcript indexing pipelines.

Qdrant and Groq for providing fast vector search and LLM inference infrastructure.

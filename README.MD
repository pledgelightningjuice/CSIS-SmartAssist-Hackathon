# CSIS SmartAssist

An AI-powered support assistant for the BITS Pilani Goa Campus Computer Science department. Combines a RAG-based Q&A chatbot with a smart room/lab booking system — all running fully on-premise.

## Features

- **Natural Language Q&A** — Ask questions about department policies, procedures, and deadlines. Answers are sourced directly from uploaded documents with page-level citations.
- **Smart Room & Lab Booking** — Book resources in plain English. The system extracts details automatically and checks Google Calendar availability.
- **Admin Approval Workflow** — Booking requests trigger an email to the admin with one-click Approve/Reject buttons. Approval automatically blocks the slot on Google Calendar and notifies the user.
- **Knowledge Base Management** — Admins can upload PDFs/DOCX files that are instantly indexed and queryable by the chatbot.
- **Department Announcements** — Admins post announcements that appear in real time on the Faculty portal.
- **Three Role Portals** — Student, Faculty, and Admin views with role-appropriate features.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| Backend | FastAPI (Python) |
| LLM | Ollama (LLaMA 3 8B — runs locally) |
| RAG | LangChain + ChromaDB + SentenceTransformers |
| Document Parsing | PyMuPDF |
| Booking Storage | ChromaDB |
| Calendar | Google Calendar API |
| Email | Gmail SMTP |

---

## Prerequisites

Before running, make sure you have:

- **Python 3.10+** — [python.org](https://python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Ollama** — [ollama.com](https://ollama.com) — download and install
- **Git** — [git-scm.com](https://git-scm.com)
- A **Gmail account** with 2-Step Verification enabled
- A **Google Cloud project** with Calendar API enabled

---

## Setup Guide

### Step 1 — Clone the repository

```bash
git clone https://github.com/Mitresh-J/CSIS-SmartAssist-Hackathon.git
cd CSIS-SmartAssist-Hackathon
```

---

### Step 2 — Pull the LLaMA 3 model

```bash
ollama pull llama3
```

This downloads the ~4.7GB model. Only needs to be done once.

---

### Step 3 — Set up the backend

```bash
cd backend
python -m venv venv
```

**Activate the virtual environment:**

Windows (Command Prompt):
```bash
venv\Scripts\activate.bat
```

Windows (PowerShell) — if you get a security error, run this first:
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then:
```bash
venv\Scripts\activate
```

Mac/Linux:
```bash
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

---

### Step 4 — Create the .env file

Create a file named `.env` inside the `backend/` folder with the following content:

```
GMAIL_USER=your.gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
BASE_URL=http://localhost:8000
ADMIN_EMAIL=admin.email@gmail.com
```

**What to change:**
- `GMAIL_USER` — the Gmail account emails will be sent FROM
- `GMAIL_APP_PASSWORD` — generate this at [myaccount.google.com](https://myaccount.google.com) → Security → 2-Step Verification → App Passwords → create one named "CSIS"
- `BASE_URL` — keep as `http://localhost:8000` for local testing. If you want the admin approve/reject email links to work from another device, use [ngrok](https://ngrok.com): run `ngrok http 8000` and replace with the generated URL
- `ADMIN_EMAIL` — the Gmail address where admin booking approval requests will be sent TO (can be same as GMAIL_USER)

---

### Step 5 — Set up Google Calendar

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Go to **APIs & Services → Enable APIs** → search and enable **Google Calendar API**
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Configure the consent screen (choose External, fill in app name and your email)
6. Application type: **Desktop App** → Create
7. Download the JSON file, rename it to `credentials.json`, place it in the `backend/` folder
8. Run this once to authenticate:

```bash
python calendar_service.py
```

A browser window will open — log in and click Allow. This creates a `token.pickle` file. You only need to do this once.

---

### Step 6 — Start the backend

Open **two terminals**, both in the `backend/` folder with venv active:

**Terminal 1 — Start Ollama:**
```bash
ollama serve
```

**Terminal 2 — Start FastAPI:**
```bash
uvicorn main:app --reload --port 8000
```

Verify it's running by visiting: [http://localhost:8000/docs](http://localhost:8000/docs)

You should see the FastAPI docs with all endpoints listed.

---

### Step 7 — Set up the frontend

Open a new terminal in the root of the project:

```bash
cd CSIS-SmartAssist-Hackathon
npm install
npm run dev
```

Frontend runs at: [http://localhost:5173](http://localhost:5173)

---

### Step 8 — Upload documents to the knowledge base

1. Open [http://localhost:5173](http://localhost:5173)
2. Log in as Admin (see demo credentials below)
3. Go to **Knowledge Base → Upload Document**
4. Upload any PDF or DOCX file — it will be indexed automatically and become queryable via the chatbot

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | f20250699@goa.bits-pilani.ac.in | student123 |
| Faculty | faculty@goa.bits-pilani.ac.in | faculty123 |
| Admin | admin@goa.bits-pilani.ac.in | admin123 |
 
These can be set in LoginView.tsx
---

## Project Structure

```
CSIS-SmartAssist-Hackathon/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── rag.py               # RAG pipeline (ChromaDB + LangChain + Ollama)
│   ├── intent.py            # Intent classifier + entity extractor
│   ├── ingest.py            # PDF/DOCX ingestion into ChromaDB
│   ├── bookings.py          # Booking & announcement API routes
│   ├── database.py          # ChromaDB storage for bookings & announcements
│   ├── email_service.py     # Gmail SMTP email notifications
│   ├── calendar_service.py  # Google Calendar availability + event creation
│   ├── requirements.txt     # Python dependencies
│   └── docs/                # Uploaded documents stored here
├── src/
│   └── app/
│       └── components/
│           ├── LoginView.tsx
│           ├── StudentView.tsx
│           ├── FacultyView.tsx
│           └── AdminView.tsx
├── package.json
└── vite.config.ts
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Send a message — returns Q&A answer or booking card |
| POST | `/bookings/confirm` | Confirm a booking — triggers admin email |
| GET | `/bookings` | Get all bookings (optional `?user_id=` filter) |
| PATCH | `/bookings/{id}` | Update booking status |
| GET | `/bookings/{id}/action` | One-click approve/reject from email link |
| POST | `/documents` | Upload and index a document |
| POST | `/announcements` | Post a department announcement |
| GET | `/announcements` | Get all announcements |
| GET | `/health` | Health check |

---

## Resetting for a Fresh Demo

To clear all bookings and start fresh:

```bash
# In the backend/ folder
# Windows
rmdir /s /q chroma_db

# Mac/Linux
rm -rf chroma_db
```

Restart the server — ChromaDB will recreate itself empty. Re-upload your documents through the Admin Knowledge Base after restarting.

Also delete any `[CSIS Booking]` test events from Google Calendar manually.

---

## Known Limitations & Future Scope

- **LLM speed** — LLaMA 3 runs on CPU by default. An NVIDIA GPU with CUDA dramatically improves response time. 
- **Single machine** — Currently runs on one device. Phase 2 involves PostgreSQL + pgvector for shared multi-user deployment on campus servers.
- **Basic authentication** — Demo uses hardcoded credentials. Phase 2 integrates BITS SSO/LDAP authentication.
- **No booking cancellation** — Planned for Phase 2.

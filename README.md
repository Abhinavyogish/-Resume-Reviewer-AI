# AI-Based Resume Screening & Skill Intelligence Platform

**Capstone Project** | **Abhinav Yogish**

---

An AI-powered platform that parses resumes, extracts candidate intelligence, and ranks candidates against job descriptions with explainable scoring and bias detection.

## Features

- **Resume upload** — PDF, DOCX, PNG, JPG (OCR for images)
- **Structured extraction** — Skills, experience, education, seniority via LLM
- **Semantic matching** — Vector embeddings + cosine similarity
- **Weighted scoring** — Skill (40%), Experience (20%), Semantic (25%), Education (10%), Industry (5%)
- **Explainable results** — AI-generated recruiter-friendly explanations
- **Bias detection** — Heuristic flags for gender-coded language, age indicators, prestige bias
- **Persistent storage** — SQLite (no database install required)

## Tech Stack

| Layer   | Technologies                                      |
|---------|---------------------------------------------------|
| Backend | Node.js, TypeScript, Fastify, Prisma              |
| Database| SQLite (local file)                               |
| AI      | OpenRouter API (LLM + embeddings)                 |
| Frontend| Next.js 14, Tailwind CSS, Recharts                |
| Validation | Zod                                            |

## Quick Start

### 1. Prerequisites

- Node.js 18+
- OpenRouter API key — [openrouter.ai](https://openrouter.ai)

### 2. Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

npm install
npx prisma db push
npm run dev
```

In a new terminal:

```bash
# Frontend
cd frontend
npm install
npm run dev
```

### 3. Run

- **Frontend:** http://localhost:3000  
- **Backend:** http://localhost:3001  

1. Upload a resume (PDF, DOCX, PNG, or JPG)  
2. Create a job description  
3. Open the job → **Rank Candidates**  

## Project Structure

```
Capstone Ai1/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # SQLite schema
│   ├── src/
│   │   ├── ai/                # OpenRouter client, embeddings, extraction
│   │   ├── bias/               # Bias analyzer
│   │   ├── scoring/            # Scoring engine
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── server.ts           # Entry point
│   └── .env.example
├── frontend/
│   ├── app/                    # Next.js pages
│   ├── components/             # UI components
│   └── lib/api.ts              # API client
└── README.md
```

## API Endpoints

| Method | Endpoint          | Description                 |
|--------|-------------------|-----------------------------|
| POST   | /resume/upload    | Upload resume (PDF/DOCX/PNG/JPG) |
| GET    | /resume           | List resumes                |
| POST   | /job              | Create job description      |
| GET    | /job              | List jobs                   |
| GET    | /job/:id          | Get job                     |
| POST   | /ranking/:jobId   | Rank candidates (compute)   |
| GET    | /ranking/:jobId   | Get saved rankings          |

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and add your OpenRouter API key. Required:

- `DATABASE_URL` — SQLite path (default: `file:./dev.db`)
- `OPENROUTER_API_KEY` — From [openrouter.ai](https://openrouter.ai)

## Author

**Abhinav Yogish** — Capstone Project

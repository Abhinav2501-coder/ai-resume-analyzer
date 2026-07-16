## AI Resume Analyzer

AI Resume Analyzer is a single-page React + TypeScript application that helps candidates and recruiters evaluate resumes quickly using AI-driven scoring, tailored feedback, and a contextual coaching chatbot. The app demonstrates how a modern front-end app can integrate client-side storage, serverless auth, and LLM-based evaluation with minimal backend work using Puter.js.

---

## 📋 Table of contents

1. [About](#about)
2. [Key features](#key-features)
3. [Real-world advantages](#advantages)
4. [Tech stack & architecture](#tech-stack--architecture)
5. [Getting started (local)](#getting-started)
6. [AI integration & Puter.js details](#ai-integration--puterjs)
7. [Repo pointers (where code lives)](#repo-pointers)
8. [Run & build commands](#run--build)
9. [Contributing & License](#contributing)


## <a name="about">About</a>

This project analyzes resumes (PDF) and provides ATS-style scoring and actionable feedback using client-side integrations with Puter.js and LLM services. It is intended as a demo and starter kit for building privacy-forward, low-backend recruitment tooling.


## <a name="key-features">Key features</a>

- Upload and manage multiple resumes (PDF)
- Persistent resume storage using Puter-backed storage
- AI-powered resume scoring and matching to job descriptions
- Contextual coaching chatbot (Master Career Coach)
- Reusable React components and responsive UI
- Visual score badges and summary reports


## <a name="advantages">Real-world advantages</a>

- Faster, more consistent candidate screening with quantitative scores
- Tailored, actionable feedback to help candidates improve
- Privacy-first design: data can be kept client-controlled via Puter
- Low infrastructure cost and easier deployment (minimal backend)


## <a name="tech-stack--architecture">Tech stack & architecture</a>

- Frontend: React + TypeScript
- Bundler / dev server: Vite
- Styling: Tailwind CSS (plus shadcn/ui patterns)
- State: Zustand
- Platform & AI: Puter.js (auth, storage, AI calls)

Architecture

This section describes the high-level components, data flow, and integrations used by the project. The application is designed as a client-first SPA that leverages Puter.js for auth, storage, and AI calls so most processing and orchestration happen in the browser.

```mermaid
flowchart LR
  U[User Browser]
  subgraph Frontend[React SPA]
    U --> UI[UI Components\n(app/components)]
    UI --> Upload[FileUploader / Upload]
    Upload --> PDF2IMG[PDF → Image\n(app/lib/pdf2img.ts)]
    PDF2IMG --> OCR[OCR / Text Extraction]
    UI --> Coach[MasterCoach Chatbot]
    UI --> Score[Scoring UI / Badges]
  end

  Frontend --> Puter[Puter.js\n(Auth, Storage, AI)]
  Puter --> Storage[Object Storage]
  Puter --> AI[LLM / OCR Providers]
  AI --> Model[LLM / OCR Services]

  classDef infra fill:#f8f9fa,stroke:#333,stroke-width:1px;
  class Puter,Storage,AI,Model infra;
```

Key architecture notes
- Frontend-only SPA: all UI code lives in `app/components/` and `app/routes/`.
- Processing helpers and AI glue code are in `app/lib/` (see `pdf2img.ts`, `puter.ts`, `utils.ts`).
- Data flow: user uploads PDF → convert pages to images → OCR/text extraction → create prompt → call AI via Puter → present score and feedback.
- Authentication & storage: Puter.js handles client auth flows and stores files/user data in Puter-backed storage.
- Deployment: app can be served as static files (Vite build) from CDN or static hosting; Puter.js remains the runtime integration for auth and AI.


## <a name="getting-started">Getting started (local)</a>

Prerequisites
- Node.js 18+ and npm / pnpm / yarn
- (Optional) a Puter account if you want to use hosted Puter services

Clone and install

```bash
git clone https://example.com/your-repo.git
cd ai-resume-analyzer
npm install
```

Environment & Puter configuration
- Create a `.env.local` in the project root for any API keys or client IDs.
- This repository reads Puter-related initialization from `app/lib/puter.ts` — inspect that file for required values and expected environment variable names.

Run locally

```bash
npm run dev
# open http://localhost:5173
```


## <a name="ai-integration--puterjs">AI integration & Puter.js details</a>

- Puter.js provides client-side auth, storage, and helpers to call AI (LLMs) and OCR services without a dedicated backend.
- In this project the key AI responsibilities are:
  - PDF processing and page-to-image conversion (`app/lib/pdf2img.ts`)
  - Text extraction and OCR (where enabled)
  - Prompting LLMs to score and summarize resumes via Puter client calls (`app/lib/puter.ts`)
  - Chatbot context and memory for the MasterCoach feature

How to adapt AI behavior
- Edit `app/lib/puter.ts` to change model selection, API endpoints, or prompt structure.
- Prompt templates and helpers can be found/extended in `app/lib/utils.ts`.


## <a name="repo-pointers">Repo pointers (where code lives)</a>

- Main UI: `app/root.tsx`, `app/routes.ts`, `app/app.css`
- Components: `app/components/` (Accordion, FileUploader, MasterCoach, ResumeCard, ScoreBadge, etc.)
- AI / platform helpers: `app/lib/` (pdf2img.ts, puter.ts, utils.ts)
- Types: `types/` and `app/puter.d.ts`


## <a name="run--build">Run & build</a>

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Preview production build: `npm run preview`





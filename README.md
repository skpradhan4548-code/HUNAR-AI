# Hunar.AI Platform — Assignment Submission

## Overview

This repository contains three web applications built as part of the Hunar.AI hiring assignment:

| App | Description | Route |
|-----|-------------|-------|
| **App 1: AI Hiring Assistant** | Voice AI-powered phone interviews using Hunar.AI | `/hiring` |
| **App 2: People Search & Reachout** | JD-to-candidate matching + voice outreach via PDL + Hunar.AI | `/people-search` |
| **App 3: Smart Attendance** | LLM-powered attendance system (no smartphones) using IVR/USSD/SMS | `/attendance` |

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui components
- **Backend**: Python 3.11+, FastAPI, httpx, uvicorn
- **Voice AI**: Hunar.AI Voice Agents API
- **People Search**: People Data Labs (PDL) API + mock fallback

## Project Structure

```
HUNAR/
├── frontend/          # Next.js + TypeScript monorepo (all 3 apps)
│   └── src/app/
│       ├── page.tsx           # Landing page
│       ├── hiring/            # App 1: AI Hiring Assistant
│       ├── people-search/     # App 2: People Search & Reachout
│       └── attendance/        # App 3: Smart Attendance
└── backend/           # Python FastAPI backend
    ├── main.py
    ├── requirements.txt
    └── .env.example
```

## Setup Instructions

### Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys

# Run server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the platform.

## Environment Variables

### Backend `.env`
```
HUNAR_API_KEY=your_hunar_api_key_here
PDL_API_KEY=your_pdl_api_key_optional
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ **Security Note**: The API key is stored only in the backend `.env` file and is never exposed to the frontend or committed to Git. All Hunar API calls are proxied through the backend.

## Features

### App 1: AI Hiring Assistant
- List and manage voice AI interview agents
- Create custom hiring agents with tailored prompts
- Initiate phone interviews with candidates
- Track real-time call status
- View structured interview results

### App 2: People Search & Reachout
- Paste a job description → AI extracts requirements
- Search candidates via PDL API (or realistic mock data)
- View candidate profiles with skills, experience, location
- One-click voice outreach via Hunar.AI
- Dashboard to track all outreach results

### App 3: Smart Attendance (Design + Demo)
- Interactive solution architecture
- IVR, USSD, SMS, and Biometric channel explanations
- Live attendance log simulation
- Technology tradeoff comparison table

## API Documentation

- Hunar.AI Voice API: https://api.voice.hunar.ai/docs/external/
- PDL People API: https://docs.peopledatalabs.com/

## Author

**Saroj Pradhan**  
Assignment submitted for Hunar.AI hiring process — August 2026

# AI Judge - Mock Trial Platform

A cutting-edge AI-powered legal simulation platform that allows legal professionals to test their cases, present arguments, and receive realistic verdicts before stepping into the real courtroom.

## 📋 Table of Contents

- Project Overview
- Features
- Tech Stack
- Prerequisites
- Installation & Setup
- How to Run
- Project Architecture
- How It Works
- Environment Variables
- API Documentation
- Troubleshooting
- Contributing
- License

---

## 🎯 Project Overview

**AI Judge** is a web-based platform that simulates a courtroom environment powered by Google's Gemini AI. It enables legal professionals to:

- Upload legal documents and evidence
- Present opening arguments and counter-arguments
- Receive AI-generated verdicts based on legal precedents
- Challenge verdicts with up to 5 counter-arguments
- Experience realistic mock trials before actual court proceedings

The platform ensures fair deliberation by giving both parties (Plaintiff and Defendant) equal opportunity to present their cases.

---

## ✨ Features

- 📄 **Multi-Format Document Support**: Upload PDF, Word, and text documents
- 🤖 **AI-Powered Verdicts**: Trained on thousands of real court cases
- ⚖️ **Fair Deliberation**: Both parties receive equal argument opportunities
- 🎯 **Interactive Arguments**: Challenge the initial verdict with up to 5 counter-arguments
- 🌍 **International Case Support**: Region-specific legal knowledge
- 📊 **Legal Accuracy**: Decisions based on actual legal frameworks and precedents
- 💾 **Document Management**: Secure storage via Supabase
- 🎨 **Modern UI**: Dark-themed, responsive design with real-time updates

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router** - Navigation
- **Lucide Icons** - Icon library

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Google Generative AI** - AI model (Gemini 2.5 Flash)
- **CORS** - Cross-origin resource sharing

### Database & Storage
- **Supabase** - PostgreSQL database & file storage
- **Supabase Storage** - Secure document storage

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **bun** - Package manager
- **Git** - Version control
- **Supabase Account** - [Create here](https://supabase.com)
- **Google Cloud Account** - For Gemini API key [Setup](https://cloud.google.com/docs/authentication/application-default-credentials)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

````bash
git clone https://github.com/yourusername/verdict-ai.git
cd verdict-ai
cd backend
npm install
# or
bun install
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
PORT=8787
How to get these keys:

GEMINI_API_KEY:

Go to Google AI Studio
Click "Create API Key"
Copy the key
SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY:

Go to Supabase Dashboard
Create a new project
Go to Settings → API
Copy Project URL and Service Role Key

Verify backend setup
cat .env  # Verify keys are present

Navigate to frontend folder
cat .env  # Verify keys are present
3.2 Install dependencies

cd ../frontend

Install dependencies
VITE_GEMINI_PROXY_URL=http://localhost:8787/analyze
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
```

### Step 2: Set up the Database

-- Cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  plaintiff_name VARCHAR(255) NOT NULL,
  defendant_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Case documents table
CREATE TABLE case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  party_side VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('case-documents', 'case-documents', false);

-- Set RLS policies for storage
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'case-documents');

CREATE POLICY "Allow authenticated downloads" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'case-documents');


verdict-ai/
├── backend/
│   ├── server.js           # Express server with Gemini AI integration
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.tsx          # Home page
│   │   │   ├── CaseSetup.tsx      # Case creation & document upload
│   │   │   ├── Courtroom.tsx      # Mock trial interface
│   │   │   └── NotFound.tsx       # 404 page
│   │   ├── components/            # Reusable UI components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── integrations/          # Supabase integration
│   │   ├── utils/                 # Helper functions
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
└── supabase/
    ├── config.toml
    └── migrations/

    1. HOME PAGE (Index.tsx)
   ↓
   User clicks "Create Mock Trial"
   ↓
2. CASE SETUP (CaseSetup.tsx)
   ├── Enter case title
   ├── Enter plaintiff & defendant names
   ├── Upload documents for both parties
   ├── Generate unique case ID
   ↓
3. COURTROOM (Courtroom.tsx)
   ├── Initial verdict from AI Judge
   ├── Both parties present up to 5 arguments each
   ├── AI responds to each argument
   ├── Final verdict rendered
   ↓
4. CASE CONCLUSION
   User can start new case or return home

   Frontend (React)
    ↓
User submits case arguments
    ↓
POST request to http://localhost:8787/analyze
    ↓
Backend (Express)
    ↓
Build prompt with case details + arguments
    ↓
Call Google Gemini 2.5 Flash API
    ↓
Receive AI verdict
    ↓
Return JSON response to Frontend
    ↓
Frontend displays verdict in real-time

User uploads PDF/Word/Text files
    ↓
Frontend: Extract text from file
    ↓
Supabase Storage: Store physical file
    ↓
Supabase DB: Store metadata (filename, size, path)
    ↓
Frontend: Display file list with delete option
    ↓
On delete: Remove from storage + DB
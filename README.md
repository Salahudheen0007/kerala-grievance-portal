# CM Kerala — Public Grievance Redressal Portal

## Overview

CM Kerala is a recruitment-project prototype of a public grievance redressal portal. It demonstrates how citizens could submit complaints, track their status, and receive AI-assisted grievance classification.

**Disclaimer:** This is an independent demonstration project and is not an official Government of Kerala website or service. All test data is fictional.

## Features

- Responsive React interface with navigation and department information.
- Grievance submission with district, category, subject, and description.
- Unique reference IDs for submitted grievances.
- Grievance tracking by reference ID.
- Admin demonstration dashboard for viewing grievances and updating their status.
- Supabase PostgreSQL database integration.
- FastAPI backend and REST API endpoints.
- Google Gemini AI-assisted category classification, department suggestion, priority assessment, and summary generation.
- Input validation and API error handling.

## Technology Stack

**Frontend**

- React
- Vite
- JavaScript
- CSS

**Backend**

- Python
- FastAPI
- Uvicorn
- Pydantic

**Database**

- Supabase PostgreSQL

**AI**

- Google Gemini API
- Google Gen AI Python SDK

## Project Structure

```
kerala-grievance-portal/
├── backend/
│   ├── main.py
│   ├── .env
│   └── .venv/
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── index.css
├── index.html
├── package.json
└── README.md
```

The `.env` file and `.venv` directory are local development resources and should not be committed to Git.

## Prerequisites

- Python 3.13 or compatible Python version
- Node.js and npm
- A Supabase project
- A Google Gemini API key

## Local Setup

### 1. Frontend

Open a terminal in the project root:

```
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```
http://localhost:5173
```

### 2. Backend

Open a separate terminal:

```
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install fastapi "uvicorn[standard]" sqlalchemy "psycopg[binary]" pydantic-settings python-multipart supabase python-dotenv google-genai
python -m uvicorn main:app --reload
```

The API is available at:

```
http://127.0.0.1:8000
```

Interactive API documentation:

```
http://127.0.0.1:8000/docs
```

### 3. Environment Variables

Create `backend/.env` and configure the following variables using your own credentials:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Never commit actual credentials to source control or expose secret keys in frontend code.

Ensure the backend loads the environment variables before starting the application.

### 4. Database Setup

Create a `public.grievances` table in Supabase with the following SQL:

```
create table public.grievances (
    id bigint generated always as identity primary key,
    reference_id text unique not null,
    district text not null,
    category text not null,
    subject text not null,
    description text not null,
    department text not null,
    status text not null default 'Submitted',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
```

Enable Row Level Security and configure appropriate policies for the intended access model. The backend must use appropriately protected credentials and validated inputs.

## API Endpoints

| Method | Endpoint                                | Purpose                            |
| ------ | --------------------------------------- | ---------------------------------- |
| GET    | `/`                                     | API root                           |
| GET    | `/api/health`                           | Health check                       |
| POST   | `/api/grievances`                       | Submit a grievance                 |
| GET    | `/api/grievances`                       | List grievances for the dashboard  |
| GET    | `/api/grievances/{reference_id}`        | Track a grievance                  |
| PATCH  | `/api/grievances/{reference_id}/status` | Update grievance status            |
| POST   | `/api/ai/analyze`                       | Analyze a grievance with Gemini AI |

## AI-Assisted Analysis

The AI endpoint accepts a grievance description and returns a suggested category, responsible department, priority, and summary.

Example request:

```
{
  "description": "A public water pipeline is leaking and nearby houses have no water supply."
}
```

The AI-generated result is intended to support demonstration and triage. It must be reviewed before any real-world decision. Priority classifications are suggestions, not official emergency assessments.

## Testing Checklist

- [x] Frontend starts successfully.
- [ ] Backend starts successfully.
- [ ] A grievance can be submitted.
- [ ] A reference ID is returned.
- [ ] The submitted grievance appears in the dashboard.
- [ ] The grievance status can be updated.
- [ ] The grievance can be tracked by reference ID.
- [ ] AI analysis returns a category, department, priority, and summary.
- [ ] Invalid input and API failures are handled clearly.
- [ ] No API secrets are committed to source control.

## Security and Limitations

This is a demonstration prototype, not a production-ready public service. Before real deployment, implement administrator authentication and authorization, appropriate database access policies, rate limiting, robust input validation, logging, secret management, and privacy protections.

The dashboard's ability to view and update grievances must not be exposed publicly without access controls. AI outputs may be inaccurate and require human verification.

## Future Improvements

- Secure administrator login and role-based access control.
- Notifications when grievance status changes.
- File attachments and supporting evidence.
- Search, filters, and pagination in the dashboard.
- Audit logs and analytics.
- Automated tests and production deployment.

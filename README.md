# CM Kerala — Public Grievance Redressal Portal

CM Kerala is a recruitment-project prototype that demonstrates a simple digital workflow for public grievances. Citizens can submit a grievance, receive a reference ID, and check its status. An AI-assisted endpoint can suggest a category, department, priority, and summary to help with initial triage.

> **Disclaimer:** This is an independent demonstration project. It is not an official Government of Kerala website or service. Any sample data should be fictional. Do not submit real personal or sensitive information.

## Project links

- **Live application:** https://kerala-grievance-portal-git-main-salahudheen0007.vercel.app/
- **GitHub repository:** https://github.com/Salahudheen0007/kerala-grievance-portal
- **Backend API:** https://kerala-grievance-api.onrender.com
- **API health check:** https://kerala-grievance-api.onrender.com/api/health
- **Interactive API documentation:** https://kerala-grievance-api.onrender.com/docs

The backend is hosted on Render and the frontend is hosted on Vercel. Render's free service may sleep after inactivity, so the first backend request after a quiet period can take longer while the service starts. You do not need to run the project on your own computer for someone to open the live website.

## Features

- Responsive React interface with navigation and department information
- Grievance submission with district, category, subject, and description
- Unique reference ID for tracking a submitted grievance
- Grievance status lookup by reference ID
- Admin dashboard for viewing grievances and updating their status
- Supabase PostgreSQL database integration
- FastAPI REST API
- Gemini AI-assisted category classification, department suggestion, priority assessment, and summary generation
- Input validation and API error handling

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| Database | Supabase PostgreSQL |
| AI | Google Gemini API, Google Gen AI Python SDK |
| Hosting | Vercel (frontend), Render (backend) |

## How to run the project locally

These steps are for Windows PowerShell. Make sure Python, Node.js, and npm are installed first.

### 1. Download the source code

Open PowerShell and run:

```powershell
git clone https://github.com/Salahudheen0007/kerala-grievance-portal.git
cd kerala-grievance-portal
```

Alternatively, open the GitHub repository and choose **Code → Download ZIP**, then extract the ZIP and open the extracted folder in VS Code.

### 2. Set up the backend

Open a terminal in the project root, then run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

If PowerShell blocks virtual-environment activation, you can run the environment's Python directly instead, or use a terminal where script activation is permitted.

Install the project's dependencies:

```powershell
pip install -r requirements.txt
```

If `requirements.txt` is not present in the repository, install the dependencies used by the application:

```powershell
pip install fastapi "uvicorn[standard]" supabase python-dotenv google-genai
```

Create a file named `.env` inside the `backend` folder. Add your own credentials; do not use someone else's keys:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_backend_key
GEMINI_API_KEY=your_gemini_api_key
ADMIN_API_KEY=choose_a_private_admin_key
```

Use the appropriate Supabase backend key for your project and keep it private. Never put secret keys in React code or commit them to GitHub. The `ADMIN_API_KEY` value must match the key used when authenticating to protected admin endpoints.

Start the backend from inside the `backend` folder:

```powershell
uvicorn main:app --reload
```

The local API should be available at `http://127.0.0.1:8000`. Open `http://127.0.0.1:8000/docs` to inspect the API, or `http://127.0.0.1:8000/api/health` to check its health.

Keep this terminal running while testing the local application.

### 3. Set up the Supabase database

Create a Supabase project and open its SQL Editor. If the `grievances` table does not already exist, run:

```sql
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

Copy the project URL and the appropriate backend API key from your Supabase project settings into `backend/.env`. Configure Row Level Security and database permissions for your chosen access model. Do not expose a privileged database key in the frontend. If the table already exists, check that its columns match what the backend expects before creating another table.

### 4. Set up the frontend

Open a **second terminal** at the project root (the folder containing `package.json`). If you are currently in `backend`, return to the root:

```powershell
cd ..
npm install
```

Create a file named `.env.local` in the project root and set the local backend URL:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```powershell
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173`. Open that URL in your browser. Keep both the backend and frontend terminals running while using the local application.

### 5. Configure CORS for local development

The backend must allow the local frontend origin, normally `http://localhost:5173`. The deployed backend also needs to allow the deployed frontend's exact origin. If you change the frontend domain, update the backend CORS allow-list and redeploy the backend.

### 6. Test the main workflow

1. Open the local frontend.
2. Submit a test grievance using fictional information.
3. Confirm that a reference ID is returned.
4. Use that reference ID in the tracking page.
5. Open the admin dashboard and authenticate using the configured admin key, if prompted.
6. Try the AI analysis feature and confirm that it returns a response.
7. Check the browser and backend terminal for errors if a step fails.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | API root |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/grievances` | Submit a grievance |
| `GET` | `/api/grievances` | List grievances for the protected admin dashboard |
| `GET` | `/api/grievances/{reference_id}` | Track a grievance by reference ID |
| `PATCH` | `/api/grievances/{reference_id}/status` | Update a grievance's status (admin access required) |
| `POST` | `/api/ai/analyze` | Request AI-assisted grievance analysis |

For the full request and response schemas, use the interactive API documentation linked above.

## AI-assisted analysis

The AI endpoint accepts a grievance description and can return a suggested category, responsible department, priority, and summary. For example:

```json
{
  "description": "A public water pipeline is leaking and nearby houses have no water supply."
}
```

AI results are suggestions for demonstration and initial triage. They can be incorrect and must be reviewed by a person before any real-world decision. The priority label is not an official emergency assessment.

## Deployment notes

- The frontend is deployed on Vercel; the backend is deployed on Render.
- The Vercel project uses `VITE_API_URL` to locate the backend API. For the hosted frontend, set it to `https://kerala-grievance-api.onrender.com` in the Vercel project's environment variables, then redeploy the frontend after changing it.
- Backend secrets such as `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, and `ADMIN_API_KEY` belong in Render's environment settings, not in the frontend.
- Render's free service may spin down after inactivity. A delay on the first request after inactivity is expected; it does not mean you need to keep a laptop or terminal running.
- The GitHub repository link remains the same when you push updates to the same repository. The hosted URL normally remains the same when you redeploy the same Vercel project to the same domain.

## Security and limitations

This is a prototype, not a production-ready public service. Before using a system like this with real citizens' information, it would need a security review and stronger operational controls, including robust authentication and authorization, carefully configured database access policies, rate limiting, privacy safeguards, audit logging, monitoring, backups, and automated tests. Protect the admin dashboard and all privileged credentials. Use fictional data for demonstrations.

## Possible future improvements

- Dedicated administrator login and role-based access control
- Notifications when a grievance status changes
- Supporting-document uploads
- Search, filters, and pagination for administrators
- Audit logs and analytics
- Automated tests and stronger production monitoring

## Author

**Salahudheen C**

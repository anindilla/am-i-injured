# Am I Injured?

Helps gym users tell the difference between normal soreness, mild strain, and something that needs rest or a professional look. Not a medical diagnosis tool.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind
- **Backend:** Django REST API (stateless scoring, no database for v0)

## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # or: venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py runserver
```

API runs at **http://localhost:8000**. Analyze endpoint: `POST /api/analyze/`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (or use the default):

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then:

```bash
npm run dev
```

App runs at **http://localhost:3000**. Open **http://localhost:3000/injury-check** to use the flow.

## Deploy on Vercel

The app is a **monorepo**: the Next.js app lives in `frontend/`. To fix 404 on Vercel:

1. Open your project on [Vercel](https://vercel.com) → **Settings** → **General**.
2. Under **Root Directory**, click **Edit**, set it to **`frontend`**, and save.
3. (Optional) If you deploy the Django backend elsewhere, add an env var: **`NEXT_PUBLIC_API_URL`** = your API URL.
4. **Redeploy** (Deployments → ⋮ on latest → Redeploy).

Vercel will then build and serve the Next.js app from `frontend/`.

## Usage

1. Go to `/injury-check`.
2. Fill the multi-step form (location, pain type, scale, yes/no questions, onset timing).
3. Submit to get a risk level (Green / Yellow / Red), likely explanation, recommendations, and 48-hour monitoring checklist.

## Safety

This tool does not replace medical advice. If symptoms worsen, seek professional care.

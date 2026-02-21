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

## Deploy live (all free)

**You do not need to deploy the Django backend.** The app includes a Next.js API route (`/api/analyze`) that runs the same scoring logic. On Vercel, both the site and the analyze API run in one place—no separate server, no extra cost.

### 1. Get the frontend live on Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New…** → **Project** and **import** your repo `anindilla/am-i-injured`.
3. **Root Directory:** click **Edit**, set to **`frontend`**, then **Continue**.
4. Leave **Environment Variables** empty (so the app uses the built-in `/api/analyze`).
5. Click **Deploy**. Wait for the build to finish.
6. Your app is live at `https://am-i-injured.vercel.app` (or the URL Vercel shows). Open `/injury-check` to use it.

All of this is on Vercel’s free tier (no credit card for hobby use).

### 2. (Optional) Use the Django backend in production

Only do this if you want the Python backend live instead of the Next.js API:

- Deploy the `backend/` folder to a free host, e.g. [Render](https://render.com) (free Web Service) or [Railway](https://railway.app) (free tier). Point the service at `backend/` and run something like `gunicorn config.wsgi`.
- In Vercel, add an env var: **`NEXT_PUBLIC_API_URL`** = your backend URL (e.g. `https://your-app.onrender.com`).
- Redeploy the Vercel project so the frontend calls your backend instead of `/api/analyze`.

For most use cases, the built-in API route is enough—no backend setup required.

## Usage

1. Go to `/injury-check`.
2. Fill the multi-step form (location, pain type, scale, yes/no questions, onset timing).
3. Submit to get a risk level (Green / Yellow / Red), likely explanation, recommendations, and 48-hour monitoring checklist.

## Safety

This tool does not replace medical advice. If symptoms worsen, seek professional care.

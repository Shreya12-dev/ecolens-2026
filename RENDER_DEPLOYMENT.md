# EcoLens Deployment (Backend on Render + Frontend on Vercel)

This setup deploys:
- Flask ML backend on Render
- Next.js frontend on Vercel

## 1) Deploy Backend on Render

### Option A: Blueprint (recommended)
1. Go to Render Dashboard → New + → Blueprint.
2. Connect your repo.
3. Render will detect `render.yaml` and create only `ecolens-ml-backend`.
4. Set env var:
   - `WAQI_API_KEY` = your key
5. Deploy and wait for healthy status.

### Option B: Manual Web Service
- Runtime: Python
- Build command:
```bash
pip install -r backend/ml_models/requirements.txt
```
- Start command:
```bash
gunicorn -w 2 -b 0.0.0.0:$PORT backend.ml_models.fire_service:app --chdir .
```
- Health check path: `/health`
- Env vars:
  - `PYTHON_VERSION=3.11.0`
  - `WAQI_API_KEY=your_key`

### Verify backend
```bash
curl https://<your-render-backend>.onrender.com/health
```

---

## 2) Deploy Frontend on Vercel

1. Go to Vercel Dashboard → Add New → Project.
2. Import the same GitHub repo.
3. Framework preset: Next.js (auto-detected).
4. Root directory: `Ecolens_2026` (the folder that contains `package.json`).
5. Build command: leave default (`next build`).
6. Install command: leave default (Vercel detects lockfile).

### Vercel Environment Variables
Set these in Project Settings → Environment Variables:
- `ML_SERVER_URL=https://<your-render-backend>.onrender.com`
- `GEMINI_API_KEY=<your_gemini_key>`
- `WQI_API_KEY=<your_waqi_key>` (if used by Next API routes)

Then redeploy from Vercel.

---

## 3) How frontend talks to backend

Your Next API route `app/api/predict-fire/route.ts` already proxies requests via:
- `ML_SERVER_URL`

So frontend pages call `/api/predict-fire`, and Vercel server-side route calls Render backend.

---

## 4) Common issues (why it may feel slow)

- Render free tier cold starts (service sleeps, first request can take 30–90s).
- Vercel calling a cold Render backend increases latency.
- Gemini API quota/rate-limit can also delay chatbot responses.

To improve speed:
- Upgrade Render to always-on plan, or keep backend warm with uptime pings.
- Reduce heavy backend startup work.

---

## 5) Quick checklist

- Render backend `/health` returns `healthy`.
- Vercel env var `ML_SERVER_URL` points to Render URL.
- Frontend redeployed after env var changes.
- Chatbot env var `GEMINI_API_KEY` set in Vercel.

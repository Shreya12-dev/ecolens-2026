# EcoLens Deployment (Render Only)

This setup deploys both services on Render:
- Flask ML backend on Render
- Next.js frontend on Render

## 1) Deploy on Render (Blueprint)

### Option A: Blueprint (recommended)
1. Go to Render Dashboard → New + → Blueprint.
2. Connect your repo.
3. Render will detect `render.yaml` and create both services:
  - `ecolens-ml-backend`
  - `ecolens-frontend`
4. Set env vars:
  - Backend service: `WAQI_API_KEY`
  - Frontend service: `ML_SERVER_URL`, `GEMINI_API_KEY`, `WQI_API_KEY`
5. Set `ML_SERVER_URL` to your backend URL:
  - `https://<your-render-backend>.onrender.com`
6. Deploy and wait for both services to be healthy.

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

## 2) Manual fallback (if not using Blueprint)

Create two Render Web Services manually.

Frontend:
- Runtime: Node
- Build command:
```bash
npm ci && npm run build
```
- Start command:
```bash
npm start
```
- Health check path: `/`

### Frontend Environment Variables (Render)
Set these in frontend service env vars:
- `NODE_ENV=production`
- `ML_SERVER_URL=https://<your-render-backend>.onrender.com`
- `GEMINI_API_KEY=<your_gemini_key>`
- `WQI_API_KEY=<your_waqi_key>`

Backend:
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

---

## 3) How frontend talks to backend

Your Next API route `app/api/predict-fire/route.ts` already proxies requests via:
- `ML_SERVER_URL`

So frontend pages call `/api/predict-fire`, and Next.js server-side route calls Render backend.

---

## 4) Common issues (why it may feel slow)

- Render free tier cold starts (service sleeps, first request can take 30–90s).
- Frontend server calling a cold Render backend increases latency.
- Gemini API quota/rate-limit can also delay chatbot responses.

To improve speed:
- Upgrade Render to always-on plan, or keep backend warm with uptime pings.
- Reduce heavy backend startup work.

---

## 5) Quick checklist

- Render backend `/health` returns `healthy`.
- Frontend env var `ML_SERVER_URL` points to backend Render URL.
- Frontend redeployed after env var changes.
- Chatbot env var `GEMINI_API_KEY` set in Render frontend service.

# Deploying EcoLens to Render

This guide will help you deploy both the **Next.js frontend** and **Flask ML backend** to Render.

## 📋 Prerequisites

1. GitHub account with your repository pushed
2. [Render account](https://render.com) (free tier available)
3. WAQI API key ([get it here](https://aqicn.org/api/))

---

## 🚀 Deployment Methods

### Method 1: Using Blueprint (Recommended - Automated)

The `render.yaml` file in your repository root will automatically configure both services.

#### Steps:

1. **Go to Render Dashboard**
   - Visit [https://dashboard.render.com](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**

2. **Connect Your Repository**
   - Select **GitHub** or connect your account
   - Choose repository: `Shreya12-dev/ecolens-2026`
   - Click **"Connect"**

3. **Configure Services**
   - Render will detect `render.yaml` and show 2 services:
     - `ecolens-frontend` (Next.js)
     - `ecolens-ml-backend` (Flask)
   
4. **Set Environment Variables**
   
   **For Backend (`ecolens-ml-backend`):**
   - `WAQI_API_KEY` = `your_actual_api_key`
   
   **For Frontend (`ecolens-frontend`):**
   - Wait for backend to deploy first, then set:
   - `NEXT_PUBLIC_ML_SERVER_URL` = `https://ecolens-ml-backend.onrender.com`
     (Replace with your actual backend URL)

5. **Deploy**
   - Click **"Apply"**
   - Both services will start building and deploying
   - **Backend deploys first** (~5-10 minutes)
   - **Frontend deploys next** (~3-5 minutes)

6. **Get Your URLs**
   - Backend: `https://ecolens-ml-backend.onrender.com`
   - Frontend: `https://ecolens-frontend.onrender.com`

---

### Method 2: Manual Deployment (Alternative)

If you prefer manual control or blueprint doesn't work:

#### A. Deploy Flask Backend First

1. **Create New Web Service**
   - Dashboard → **"New +"** → **"Web Service"**
   - Connect GitHub repo: `ecolens-2026`

2. **Configure Backend**
   - **Name**: `ecolens-ml-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: *(leave empty)*
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r backend/ml_models/requirements.txt
     ```
   - **Start Command**: 
     ```bash
     gunicorn -w 2 -b 0.0.0.0:$PORT backend.ml_models.fire_service:app --chdir .
     ```

3. **Environment Variables (Backend)**
   - `PYTHON_VERSION` = `3.11.0`
   - `WAQI_API_KEY` = `your_api_key_here`

4. **Advanced Settings**
   - **Health Check Path**: `/health`
   - **Plan**: Free (or upgrade if needed)

5. **Deploy Backend**
   - Click **"Create Web Service"**
   - Wait for deployment (~5-10 minutes)
   - Copy the backend URL (e.g., `https://ecolens-ml-backend.onrender.com`)

#### B. Deploy Next.js Frontend

1. **Create New Web Service**
   - Dashboard → **"New +"** → **"Web Service"**
   - Same GitHub repo: `ecolens-2026`

2. **Configure Frontend**
   - **Name**: `ecolens-frontend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: *(leave empty)*
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```

3. **Environment Variables (Frontend)**
   - `NODE_ENV` = `production`
   - `NEXT_PUBLIC_ML_SERVER_URL` = `https://ecolens-ml-backend.onrender.com`
     *(Use your actual backend URL from step A)*

4. **Advanced Settings**
   - **Health Check Path**: `/`
   - **Plan**: Free

5. **Deploy Frontend**
   - Click **"Create Web Service"**
   - Wait for deployment (~3-5 minutes)

---

## ✅ Verify Deployment

### 1. Test Backend Health
```bash
curl https://ecolens-ml-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2026-02-26T..."
}
```

### 2. Test Fire Prediction API
```bash
curl -X POST https://ecolens-ml-backend.onrender.com/predict/fire \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 21.94,
    "lon": 89.18,
    "month": 2,
    "ndvi": 0.6,
    "lst": 28.5,
    "rainfall": 15.0,
    "humidity": 75.0,
    "wind_speed": 12.0
  }'
```

### 3. Test Frontend
- Visit your frontend URL: `https://ecolens-frontend.onrender.com`
- Navigate to **Fire Monitoring** page
- Check if data loads from backend

---

## 🔧 Troubleshooting

### Issue: Backend Not Starting

**Check Logs:**
- Go to Render Dashboard → Backend Service → Logs
- Look for errors like:
  - `ModuleNotFoundError` → Missing dependencies in `requirements.txt`
  - `Port already in use` → Shouldn't happen on Render
  - `Model not found` → Normal if model file too large (mock data will be used)

**Solutions:**
- Ensure `gunicorn` is in `requirements.txt` ✅ (Already added)
- Check Python version is 3.11.0
- Verify build command ran successfully

### Issue: Frontend Can't Connect to Backend

**Check:**
1. Backend is deployed and healthy (`/health` endpoint works)
2. `NEXT_PUBLIC_ML_SERVER_URL` is set correctly in frontend environment variables
3. Backend URL has no trailing slash
4. CORS is enabled in Flask (already configured with `flask-cors`)

**Solution:**
- Update frontend environment variable with correct backend URL
- Redeploy frontend after changing environment variables

### Issue: "Free Instance Spins Down"

Render free tier services sleep after 15 minutes of inactivity.

**Solutions:**
- Upgrade to paid plan ($7/month per service)
- Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 14 minutes
- Accept cold starts (first request after sleep takes ~30-60 seconds)

### Issue: Large Model Files

If `fire_risk_integrated_model.pkl` is too large (>500MB):

**Solutions:**
1. Add to `.gitignore` and use mock predictions
2. Host model on cloud storage (AWS S3, Google Cloud Storage)
3. Download model during build:
   ```yaml
   buildCommand: pip install ... && wget <model-url> -O backend/ml_models/fire_risk_integrated_model.pkl
   ```

---

## 📊 Cost Estimate

### Free Tier (Current Setup)
- ✅ Backend: Free (750 hours/month)
- ✅ Frontend: Free (750 hours/month)
- ⚠️ Limitations:
  - Services sleep after 15 min inactivity
  - 512 MB RAM per service
  - Shared CPU

### Paid Tier (For Production)
- Backend: **$7/month** (Starter plan)
  - Always on
  - 512 MB RAM
  - Better performance
  
- Frontend: **$7/month** (Starter plan)
  - Always on
  - 512 MB RAM

**Total**: ~$14/month for production-grade hosting

---

## 🔐 Security Best Practices

1. **Never commit API keys** to GitHub
   - Use environment variables
   - `.env` files are already in `.gitignore` ✅

2. **Use Environment Variables on Render**
   - Set secrets in Render Dashboard (not in code)
   - API keys are encrypted at rest

3. **Enable CORS properly**
   - Already configured with `flask-cors` ✅
   - Restricts access to your frontend domain

---

## 📱 Custom Domain (Optional)

### Add Custom Domain to Frontend

1. Go to Frontend Service → **Settings** → **Custom Domain**
2. Add your domain (e.g., `ecolens.yourdomain.com`)
3. Update DNS records as instructed by Render
4. SSL certificate automatically provisioned

---

## 🔄 Automatic Deployments

Render automatically redeploys when you push to GitHub:

1. Make changes locally
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Render detects changes and redeploys automatically

**Disable Auto-Deploy:**
- Service Settings → **Auto-Deploy** → Toggle off

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] `/health` endpoint returns `{"status": "healthy"}`
- [ ] Fire monitoring page loads data
- [ ] Wildlife forecasting displays predictions
- [ ] Biodiversity data loads correctly
- [ ] Pollution tracker shows metrics
- [ ] Environment variables configured
- [ ] Custom domain added (optional)
- [ ] SSL certificate active (automatic)

---

## 🎯 Quick Deploy Commands Summary

```bash
# Local development
npm run dev                    # Frontend (port 3000)
python backend/ml_models/fire_service.py  # Backend (port 5000)

# Production (Render)
# Backend: gunicorn handles Flask
# Frontend: npm start handles Next.js
```

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status Page**: https://status.render.com

---

## 🚀 You're All Set!

Your EcoLens platform is now deployed and accessible worldwide! 🌍🌿🔥🐾

**Frontend**: `https://ecolens-frontend.onrender.com`  
**Backend**: `https://ecolens-ml-backend.onrender.com`

Share your project with environmental agencies and researchers! 🎉

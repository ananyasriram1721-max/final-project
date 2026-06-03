# Sensor Monitoring App

A real-time sensor monitoring application with a FastAPI backend and React frontend.

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment to Render (Free Tier)

### Option 1: Using render.yaml (Blueprint)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and create both services

### Option 2: Manual Setup

#### Deploy Backend:
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable:
   - `FRONTEND_URL` = your frontend URL (after deploying frontend)

#### Deploy Frontend:
1. Create a new **Static Site** on Render
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` = your backend URL (e.g., `https://sensor-api.onrender.com`)
5. Add rewrite rule: `/*` → `/index.html`

### After Deployment:
- Update backend's `FRONTEND_URL` with the frontend URL for CORS
- Both services will have URLs like `https://sensor-api.onrender.com`

## Alternative Platforms

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Vercel (Frontend only) + Railway (Backend)
- Deploy frontend to Vercel: `npx vercel`
- Deploy backend to Railway: `railway up`
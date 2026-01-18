# 🚀 Deployment Guide - Zakvibe Web App

## Overview
Tumhara project 2 parts mein deploy hoga:
1. **Frontend (React + Vite)** → Vercel
2. **Backend (Node.js + Express)** → Railway/Render

---

## 📦 Part 1: Backend Deployment (Railway - RECOMMENDED)

### Step 1: Railway Account Setup
1. **Railway.app** pe jao aur sign up karo (GitHub se)
2. "New Project" click karo

### Step 2: Database Setup
1. Railway dashboard mein **"Add Service"** → **"PostgreSQL"** select karo
2. Database automatically create ho jayega
3. `DATABASE_URL` automatically environment variables mein aa jayega

### Step 3: Backend Deploy
1. Railway mein **"New Service"** → **"GitHub Repo"** select karo
2. Apna GitHub repo connect karo
3. **Root Directory**: `/backend` set karo
4. **Environment Variables** add karo:
   ```env
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=<generate-strong-secret>
   JWT_REFRESH_SECRET=<generate-strong-secret>
   SERPAPI_KEY=<your-key>
   GEMINI_API_KEY=<your-key>
   TELEGRAM_BOT_TOKEN=<your-token>
   TELEGRAM_ADMIN_CHAT_ID=<your-chat-id>
   DATABASE_URL=<automatically-set-by-railway>
   ```

5. Deploy kar do! Railway automatically:
   - Dependencies install karega
   - Prisma generate karega
   - Server start karega

6. **Backend URL mil jayega**: `https://your-app.railway.app`

### Generate Strong Secrets (Required!)
Terminal mein run karo:
```bash
# JWT Secret generate karne ke liye
openssl rand -base64 32

# Refresh Secret generate karne ke liye
openssl rand -base64 32
```

---

## 🎨 Part 2: Frontend Deployment (Vercel)

### Step 1: Vercel Account Setup
1. **Vercel.com** pe jao aur sign up karo (GitHub se)
2. "Add New Project" click karo

### Step 2: GitHub Repo Import
1. Apna repo select karo
2. **Framework Preset**: Vite detect ho jayega
3. **Root Directory**: Root rakhna (/)
4. **Build Command**: `npm run build` (already set)
5. **Output Directory**: `dist` (already set)

### Step 3: Environment Variables
Vercel dashboard mein ye variables add karo:
```env
VITE_API_URL=https://your-backend.railway.app
VITE_APP_URL=https://your-app.vercel.app
```

### Step 4: Update Configuration
1. **`vercel.json`** file ko edit karo (already created)
2. Backend URL update karo line 9 pe:
   ```json
   "destination": "https://your-actual-backend.railway.app/api/:path*"
   ```

### Step 5: Deploy!
1. "Deploy" button dabao
2. 2-3 minutes mein live ho jayega
3. **Live URL**: `https://your-app.vercel.app`

---

## ⚙️ Alternative: Backend on Render.com

Agar Railway use nahi karna toh Render use kar sakte ho:

### Render Setup
1. **Render.com** pe jao
2. "New Web Service" create karo
3. GitHub repo connect karo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run prisma:generate`
   - **Start Command**: `npm run start:prod`
   - **Environment**: Node
   - **Plan**: Free

5. PostgreSQL database separately add karo:
   - "New" → "PostgreSQL"
   - Database URL automatically miljayega

6. Same environment variables add karo as Railway

---

## 🔧 Important Configuration Updates

### 1. Update CORS in Backend
File: `backend/src/server.js`

Make sure CORS allows your Vercel domain:
```javascript
const corsOptions = {
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
};
app.use(cors(corsOptions));
```

### 2. Update API URL in Frontend
File: `.env.production` (already created)
```env
VITE_API_URL=https://your-backend.railway.app
```

### 3. Database Migration
Production database (PostgreSQL) setup ke liye:
```bash
# Development se production schema copy karo
cp backend/prisma/schema.production.prisma backend/prisma/schema.prisma

# Railway/Render mein auto-run hoga via build command
```

---

## ✅ Post-Deployment Checklist

### Testing Backend
```bash
# Health check
curl https://your-backend.railway.app/health

# API test
curl https://your-backend.railway.app/api/auth/health
```

### Testing Frontend
1. Browser mein `https://your-app.vercel.app` kholo
2. Check console for errors
3. Test authentication flow
4. Test API calls

### Common Issues & Fixes

#### ❌ CORS Error
- Backend ke CORS settings mein frontend URL add karo
- Both HTTP and HTTPS check karo

#### ❌ 500 Internal Server Error
- Railway/Render logs check karo
- Environment variables verify karo
- Database connection check karo

#### ❌ Build Failed
- `package.json` scripts check karo
- Node version verify karo (Railway uses latest)
- Dependencies install ho rahe hain check karo

---

## 🔐 Security Best Practices

1. **Never commit secrets** to GitHub:
   - Use `.gitignore` for `.env` files
   - Use platform environment variables

2. **Strong JWT Secrets**:
   - Minimum 32 characters
   - Use random generation (openssl command above)

3. **Database**:
   - Use PostgreSQL for production (not SQLite)
   - Enable SSL connections
   - Regular backups (Railway/Render automatic)

4. **API Rate Limiting**:
   - Already configured in backend
   - Monitor usage

---

## 📱 GitHub Setup (Required)

### Push to GitHub
Agar abhi tak GitHub pe nahi hai toh:

```bash
cd /Users/muskannisar/Downloads/ex-zakvibe---web-demo

# Git initialize (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Create repo on GitHub (github.com/new)
# Then connect:
git remote add origin https://github.com/your-username/zakvibe-web-demo.git
git branch -M main
git push -u origin main
```

### Important: Add .gitignore
Make sure these are in `.gitignore`:
```
node_modules/
.env
.env.local
.env.production
*.log
dist/
backend/dev.db
backend/prisma/*.db
```

---

## 🎯 Quick Deployment Summary

### Total Time: ~30 minutes

1. **5 min**: Push code to GitHub
2. **10 min**: Deploy backend to Railway
3. **5 min**: Setup PostgreSQL database
4. **10 min**: Deploy frontend to Vercel
5. **5 min**: Update URLs and test

### Cost: **FREE**
- Railway: Free tier (500 hrs/month)
- Render: Free tier (750 hrs/month)
- Vercel: Free tier (unlimited deployments)

---

## 📞 Need Help?

Common commands:

```bash
# Check Railway logs
railway logs

# Check Vercel logs
vercel logs

# Local test production build
npm run build
npm run preview
```

---

## 🔄 Continuous Deployment

Jab bhi tum GitHub pe push karoge:
- Railway automatically backend deploy karega
- Vercel automatically frontend deploy karega

```bash
git add .
git commit -m "Update features"
git push
```

Auto-deploy ho jayega! 🚀

---

## Next Steps

1. ✅ GitHub pe code push karo
2. ✅ Railway pe backend deploy karo
3. ✅ Vercel pe frontend deploy karo
4. ✅ URLs update karo
5. ✅ Test karo
6. 🎉 Live ho gaya!

---

**Happy Deploying! 🚀**

Koi problem aaye toh mujhe batao, main help karunga!

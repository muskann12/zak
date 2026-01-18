## 🔗 URL Update Guide

### Jab Railway/Render se Backend URL mile:

**Example**: `https://zakvibe-backend.up.railway.app`

---

## ✏️ Update Karne Ki 3 Jagah:

### 1. Frontend: vercel.json (Line 10)
```json
"destination": "https://zakvibe-backend.up.railway.app/api/:path*"
```
**Change**: `your-backend-url.railway.app` ko apne actual URL se replace karo

---

### 2. Frontend: .env.production (Line 4)
```env
VITE_API_URL=https://zakvibe-backend.up.railway.app
```
**Change**: `your-backend-url.railway.app` ko apne actual URL se replace karo

**Note**: Ye variable Vercel dashboard mein bhi add karna padega!

---

### 3. Backend: src/app.js (Line 97)
```javascript
origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend.vercel.app'] 
    : ['http://localhost:3000'],
```
**Change**: `yourdomain.com` ko apne Vercel URL se replace karo

**Vercel URL Example**: `https://zakvibe.vercel.app`

---

## 🔄 Step-by-Step Process:

### Step 1: Backend Deploy Karo
1. Railway pe backend deploy karo
2. URL milega: `https://abc123.up.railway.app`
3. Ye URL copy karo

### Step 2: Frontend Files Update Karo
1. **vercel.json** mein backend URL dalo (location #1)
2. **.env.production** mein backend URL dalo (location #2)
3. Git push karo:
   ```bash
   git add .
   git commit -m "Updated backend URL"
   git push
   ```

### Step 3: Frontend Deploy Karo
1. Vercel pe deploy karo
2. **Environment Variables** mein add karo:
   ```
   VITE_API_URL=https://abc123.up.railway.app
   ```
3. URL milega: `https://your-app.vercel.app`

### Step 4: Backend CORS Update Karo
1. **backend/src/app.js** mein frontend URL add karo (location #3)
2. Git push karo
3. Railway automatically redeploy karega

---

## ✅ Final URLs:

```
Backend:  https://zakvibe-backend.up.railway.app
Frontend: https://zakvibe.vercel.app
```

Dono ek dusre se connected ho jayenge! 🎉

#!/bin/bash

# URL Update Helper Script
echo "🔗 Backend URL Update Guide"
echo "================================"
echo ""
echo "Railway se jo URL milega (example: https://zakvibe-backend.up.railway.app)"
echo "Wo 3 jagah dalna padega:"
echo ""
echo "📝 Location 1: vercel.json"
echo "   File: /vercel.json"
echo "   Line 10: \"destination\": \"https://YOUR-BACKEND-URL/api/:path*\""
echo ""
echo "📝 Location 2: .env.production (Frontend)"
echo "   File: /.env.production"
echo "   Line 4: VITE_API_URL=https://YOUR-BACKEND-URL"
echo ""
echo "📝 Location 3: backend/src/app.js (CORS)"
echo "   File: /backend/src/app.js"
echo "   Line 97: origin: ['https://YOUR-FRONTEND-VERCEL-URL']"
echo ""
echo "================================"
echo ""
echo "📌 Example:"
echo "Backend URL: https://zakvibe-backend.up.railway.app"
echo "Frontend URL: https://zakvibe.vercel.app"
echo ""
echo "Then update:"
echo "1. vercel.json → https://zakvibe-backend.up.railway.app/api/:path*"
echo "2. .env.production → https://zakvibe-backend.up.railway.app"
echo "3. app.js CORS → https://zakvibe.vercel.app"
echo ""
echo "✅ Commands to update files:"
echo ""
read -p "Enter your BACKEND URL (from Railway): " BACKEND_URL
read -p "Enter your FRONTEND URL (from Vercel): " FRONTEND_URL

echo ""
echo "🔄 Updating files..."

# Update vercel.json
sed -i '' "s|https://your-backend-url.railway.app|$BACKEND_URL|g" vercel.json
echo "✅ Updated vercel.json"

# Update .env.production
sed -i '' "s|https://your-backend-url.railway.app|$BACKEND_URL|g" .env.production
echo "✅ Updated .env.production"

# Update backend app.js CORS
sed -i '' "s|https://yourdomain.com|$FRONTEND_URL|g" backend/src/app.js
echo "✅ Updated backend/src/app.js CORS"

echo ""
echo "🎉 All files updated!"
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'Updated deployment URLs'"
echo "3. git push"
echo ""
echo "Then both Railway and Vercel will auto-deploy! 🚀"

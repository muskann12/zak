#!/bin/bash

echo "🚀 Preparing for deployment..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    echo ""
    echo "✅ Git initialized!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Create a new repository on GitHub: https://github.com/new"
    echo "2. Run these commands:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR-USERNAME/zakvibe-web-demo.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
else
    echo "✅ Git already initialized"
    echo ""
    echo "📦 Adding and committing changes..."
    git add .
    git commit -m "Production ready with deployment configs"
    echo ""
    echo "🚀 Push to GitHub with:"
    echo "   git push"
fi

echo ""
echo "✅ Done! Now deploy on Railway or Render"

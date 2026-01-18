#!/bin/bash

# JWT Secrets Generate Script
echo "🔐 Generating Strong JWT Secrets..."
echo ""
echo "JWT_SECRET:"
openssl rand -base64 32
echo ""
echo "JWT_REFRESH_SECRET:"
openssl rand -base64 32
echo ""
echo "✅ Copy these secrets and add to Railway/Render environment variables"

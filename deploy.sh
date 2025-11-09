#!/bin/bash

echo "🚀 VNR Parking System Deployment Script"
echo "========================================"

# Set production environment
export NODE_ENV=production

# Backend setup
echo "📦 Setting up backend..."
cd backend
npm install --production
node database-optimize.js

# Frontend setup
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build

# Create production directories
echo "📁 Creating production structure..."
mkdir -p ../dist/backend
mkdir -p ../dist/frontend
mkdir -p ../dist/logs

# Copy backend files
cp -r . ../dist/backend/ 2>/dev/null || true
cp -r ../frontend/dist/* ../dist/frontend/ 2>/dev/null || true

echo "✅ Deployment completed!"
echo "📍 Backend: http://localhost:6228"
echo "📍 Frontend: Serve from dist/frontend/"
echo "📍 API Docs: http://localhost:6228/api/v1/docs"
echo "📍 Health: http://localhost:6228/api/v1/health"
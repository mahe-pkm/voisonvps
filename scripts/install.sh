#!/bin/bash

# Vois Auto-Installer Script
# Usage: ./install.sh

echo "🚀 Starting Vois Installation..."

# 1. Check Requirements
echo "📋 Checking requirements..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

# 2. Install Dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Dependencies failed to install."
    exit 1
fi

# 3. Environment Setup
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one from example..."
    cp .env.example .env
    echo "📝 Please edit .env with your database credentials and restart this script."
    echo "   (File opened in editor if possible, or edit manually)"
    exit 1
else
    echo "✅ .env file exists."
fi

# 4. Database Setup
echo "🗄️  Running Database Migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "❌ Database migration failed. Check your DATABASE_URL in .env."
    exit 1
fi

# 5. Build
echo "🏗️  Building Application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed."
    exit 1
fi

echo "🎉 Installation Complete!"
echo "   Run 'npm run start' to launch Vois."

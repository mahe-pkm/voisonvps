#!/bin/bash

# --- Vois Auto-Deploy Script for Hostinger VPS ---
# Usage: Upload zip, unzip, then run: ./vps_deploy.sh

echo "🚀 Starting Vois Deployment..."

# 1. Update System & Install Basics
echo "📦 Installing System Dependencies..."
sudo apt update
sudo apt install -y curl git ufw postgresql postgresql-contrib nginx certbot python3-certbot-nginx

# 2. Install Node.js 20 (Required for Next.js 15+)
if ! command -v node &> /dev/null || [[ $(node -v) =~ ^v1[0-9]\. ]]; then
    echo "🟢 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 3. Install PM2
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# 4. Environment Variables
echo "📝 Configuring Environment..."
if [ -f .env ]; then
    echo "✅ Found existing .env file, using it."
else
    echo "⚠️ No .env file found! Creating default local configuration..."
    echo 'DATABASE_URL="postgresql://vois_admin:Mahezenfone2%40@localhost:5432/vois?schema=public"' > .env
    echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
    echo 'NEXTAUTH_SECRET="supersecret_generated_key_change_me"' >> .env
    echo 'NEXT_PUBLIC_APP_URL="http://localhost:3000"' >> .env
fi

# Ensure NEXT_PUBLIC_APP_URL is set for PDF generation if missing
if ! grep -q "NEXT_PUBLIC_APP_URL" .env; then
    echo 'NEXT_PUBLIC_APP_URL="http://localhost:3000"' >> .env
fi

# Load env to check DB connection
export $(grep -v '^#' .env | xargs)

# 5. Setup Database (Local only if DATABASE_URL contains localhost)
if [[ "$DATABASE_URL" == *"localhost"* ]]; then
    echo "🗄️ Setting up Local PostgreSQL..."
    sudo systemctl start postgresql
    sudo -u postgres psql -c "CREATE USER vois_admin WITH ENCRYPTED PASSWORD 'Mahezenfone2@';" 2>/dev/null || echo "User exists"
    sudo -u postgres psql -c "CREATE DATABASE vois OWNER vois_admin;" 2>/dev/null || echo "Database exists"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vois TO vois_admin;"
    sudo -u postgres psql -c "ALTER USER vois_admin CREATEDB;"
else
    echo "🌍 Remote Database detected (Supabase/External). Skipping local DB setup."
fi

# 6. Install Project Dependencies
echo "📥 Installing Project Packages..."
# Clean install to ensure Linux binaries
rm -rf node_modules
npm install

# Install Playwright Browsers (Required for PDF)
echo "🎭 Installing Playwright Browsers..."
npx playwright install chromium
npx playwright install-deps chromium

# 7. Database Migration & Seed
echo "🔄 Running Migrations..."
npx prisma generate
npx prisma migrate deploy

echo "🌱 Seeding Database (Tax Rates, Admin User)..."
# Using ts-node to run the full seed script
npx ts-node prisma/seed.ts

# 8. Build
echo "🏗️ Building Application..."
npm run build

# 9. Start with PM2
echo "🚀 Launching Application..."
pm2 delete vois 2>/dev/null || true
pm2 start npm --name "vois" -- start
pm2 save
pm2 startup

echo "✅ DEPLOYMENT COMPLETE!"
echo "👉 Login at http://<your-ip>:3000"
echo "   User: admin@example.com"
echo "   Pass: changeme"

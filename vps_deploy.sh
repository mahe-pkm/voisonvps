#!/bin/bash

# --- Vois Auto-Deploy Script for Hostinger VPS ---
# Usage: Upload zip, unzip, then run: ./vps_deploy.sh

echo "🚀 Starting Vois Deployment..."

# 1. Update System & Install Basics
echo "📦 Installing System Dependencies..."
sudo apt update
sudo apt install -y curl git ufw postgresql postgresql-contrib nginx certbot python3-certbot-nginx

# 2. Install Node.js 18
if ! command -v node &> /dev/null; then
    echo "🟢 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 3. Install PM2
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# 4. Setup Database
echo "🗄️ Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE USER vois_admin WITH ENCRYPTED PASSWORD 'Mahezenfone2@';" 2>/dev/null || echo "User exists"
sudo -u postgres psql -c "CREATE DATABASE vois OWNER vois_admin;" 2>/dev/null || echo "Database exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vois TO vois_admin;"
sudo -u postgres psql -c "ALTER USER vois_admin CREATEDB;"

# 5. Environment Variables
echo "📝 Configuring Environment..."
if [ ! -f .env ]; then
    echo 'DATABASE_URL="postgresql://vois_admin:Mahezenfone2%40@localhost:5432/vois?schema=public"' > .env
    echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
    echo 'NEXTAUTH_SECRET="supersecret_generated_key_change_me"' >> .env
    echo ".env created."
fi

# 6. Install Project Dependencies
echo "📥 Installing Project Packages..."
# Clean install to ensure Linux binaries
rm -rf node_modules
npm install

# 7. Database Migration & Seed
echo "🔄 Running Migrations..."
npx prisma generate
npx prisma migrate deploy
# Determine if we need to seed
USER_COUNT=$(sudo -u postgres psql -d vois -c "SELECT COUNT(*) FROM \"User\";" -t | xargs)
if [ "$USER_COUNT" == "0" ]; then
    echo "🌱 Seeding Admin User..."
    node <<EOF
    const { Client } = require('pg');
    const bcrypt = require('bcrypt');
    require('dotenv').config();
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    async function seed() {
        await client.connect();
        const hash = await bcrypt.hash('changeme', 10);
        await client.query(\`INSERT INTO "User" (email, password, role, "createdAt") VALUES ('admin@example.com', \$1, 'ADMIN', NOW()) ON CONFLICT DO NOTHING\`, [hash]);
        await client.end();
    }
    seed();
EOF
fi

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

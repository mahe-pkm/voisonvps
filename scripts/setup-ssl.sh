#!/bin/bash

# Vois: Nginx + SSL Setup Script

echo "🔐 Vois SSL Setup Wizard"
echo "-----------------------------------"
echo "This script will:"
echo "1. Install Nginx & Certbot"
echo "2. Configure Nginx to proxy valid domain -> localhost:3000"
echo "3. Issue a Let's Encrypt SSL certificate"
echo ""

# 1. Ask for Domain
read -p "👉 Enter your DOMAIN NAME (e.g., invoice.mycompany.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Error: Domain cannot be empty."
    exit 1
fi

echo ""
echo "✅ Using Domain: $DOMAIN"
echo "⚠️  Ensure you have pointed an 'A Record' for $DOMAIN to this server IP before continuing!"
read -p "Press Enter to continue..."

# 2. Install Dependencies
echo ""
echo "📦 Installing Nginx & Certbot..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# 3. Create Nginx Config
echo ""
echo "⚙️  Configuring Nginx..."

CONFIG_FILE="/etc/nginx/sites-available/vois"

sudo bash -c "cat > $CONFIG_FILE" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 4. Enable Site
echo "🔗 Enabling Site..."
sudo ln -sf /etc/nginx/sites-available/vois /etc/nginx/sites-enabled/
# Remove default if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test & Restart
echo "🔄 Restarting Nginx..."
sudo nginx -t && sudo systemctl restart nginx

# 5. Run Certbot
echo ""
echo "🔒 Requesting SSL Certificate..."
sudo certbot --nginx -d $DOMAIN

echo ""
echo "-----------------------------------"
echo "🎉 SSL Setup Complete!"
echo "👉 Your site should be live at: https://$DOMAIN"
echo "-----------------------------------"

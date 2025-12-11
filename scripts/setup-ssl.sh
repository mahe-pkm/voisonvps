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
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Certbot Challenges (Robust)
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }

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
sudo mkdir -p /var/www/html
sudo ln -sf /etc/nginx/sites-available/vois /etc/nginx/sites-enabled/
# Remove default if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test & Restart
echo "🔄 Restarting Nginx..."
sudo nginx -t && sudo systemctl restart nginx

# 5. Run Certbot (Webroot Mode)
echo ""
echo "🔒 Requesting SSL Certificate..."
# We use webroot mode because it's more reliable with ProxyPass and manual location blocks
sudo certbot certonly --webroot -w /var/www/html -d $DOMAIN --non-interactive --agree-tos --email roughclick@gmail.com --deploy-hook "systemctl reload nginx"

# Install cert into Nginx manually or let certbot do it?
# Certbot certonly DOES NOT install the cert into Nginx config.
# We must use 'certbot install' or use '--nginx' BUT passed with webroot authenticator?
# Actually 'certbot --nginx' handles installation.
# The correct mix is: authenticating via webroot, installer via nginx.
# Command: sudo certbot --authenticator webroot --installer nginx -w /var/www/html -d $DOMAIN

echo "🔒 Requesting SSL Certificate (Webroot Auth + Nginx Install)..."
sudo certbot run --authenticator webroot --installer nginx -w /var/www/html -d $DOMAIN --non-interactive --agree-tos --email roughclick@gmail.com --redirect

echo ""
echo "-----------------------------------"
echo "🎉 SSL Setup Complete!"
echo "👉 Your site should be live at: https://$DOMAIN"
echo "-----------------------------------"


### 1. Connect to VPS
Open your terminal (PowerShell or Git Bash) and SSH into your server:
```bash
ssh root@YOUR_VPS_IP
# Enter your password when prompted
```

### 2. Update System
```bash
apt update && apt upgrade -y
```

### 3. Install Node.js (v20)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
# Verify
node -v
```

### 4. Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql.service
```

### 5. Configure Database
Login to Postgres setup user:
```bash
sudo -i -u postgres
psql
```
Run these SQL commands (Replace `secure_password` with a real one):
```sql
CREATE DATABASE vois;
CREATE USER vois_admin WITH ENCRYPTED PASSWORD 'Mahezenfone2@';
GRANT ALL PRIVILEGES ON DATABASE vois TO vois_admin;
ALTER DATABASE vois OWNER TO vois_admin;
\q
```
Exit postgres user:
```bash
exit
```

---

## Phase 2: Deploy Application

### 1. Install Git & PM2
```bash
sudo apt install git -y
sudo npm install -g pm2
```

### 2. Clone Repository
Navigate to standard web directory:
```bash
cd /var/www
git clone https://github.com/mahe-pkm/vois.git
cd vois
```

### 3. Setup Environment
```bash
cp .env.example .env
nano .env
```
Update `DATABASE_URL` to match what you created in Phase 1:
`postgresql://vois_admin:secure_password@localhost:5432/vois?schema=public`

### 4. Install & Build
```bash
npm install
npx prisma migrate deploy
npm run build
```

### 5. Start with PM2 (Process Manager)
This keeps your app running 24/7.
```bash
pm2 start npm --name "vois" -- start
pm2 save
pm2 startup
```

---

## Phase 3: Setup Nginx (Reverse Proxy)

This makes your app accessible on Port 80 (HTTP) instead of :3000.

### 1. Install Nginx
```bash
sudo apt install nginx -y
```

### 2. Configure Site
```bash
nano /etc/nginx/sites-available/vois
```
Paste this configuration (Update `your_domain.com`):
```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable Site
```bash
ln -s /etc/nginx/sites-available/vois /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default welcome page
nginx -t                             # Test config
systemctl restart nginx
```

---

## Phase 4: SSL (HTTPS) - Optional but Recommended

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com
```

---

## Troubleshooting

### Forgot Postgres Password?
If you lost your database password, you can reset it easily since you have root access:

1.  **Switch to postgres user**:
    ```bash
    sudo -u postgres psql
    ```bash
2.  **Reset Password**:
    ```sql
    ALTER USER vois_admin WITH PASSWORD 'new_secure_password';
    \q
    ```
3.  **Update .env**:
    Don't forget to update your `.env` file with the new password!
    ```bash
    nano /var/www/vois/.env
    ```

### Nuclear Option: Reset Database
If you messed up and want to start fresh (WARNING: Deletes all data):

1.  **Enter Postgres**:
    ```bash
    sudo -u postgres psql
    ```
2.  **Delete & Recreate**:
    ```sql
    DROP DATABASE vois;
    DROP USER vois_admin;
    
    CREATE DATABASE vois;
    CREATE USER vois_admin WITH ENCRYPTED PASSWORD 'Mahezenfone2@';
    GRANT ALL PRIVILEGES ON DATABASE vois TO vois_admin;
    ALTER DATABASE vois OWNER TO vois_admin;
    \q
    ```

### Automating a Fresh Start (The "Fix Everything" Script)
If you are lost or stuck, copy-paste this entire block into your terminal. It resets files, database, and configures the app for you.

```bash
# 1. Clean Filesystem
cd ~
sudo rm -rf /var/www/vois

# 2. Clean Database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS vois;"
sudo -u postgres psql -c "DROP USER IF EXISTS vois_admin;"

# 3. Setup Fresh Database
sudo -u postgres psql -c "CREATE USER vois_admin WITH ENCRYPTED PASSWORD 'Mahezenfone2@';"
sudo -u postgres psql -c "CREATE DATABASE vois OWNER vois_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vois TO vois_admin;"

# 4. Re-Clone Project
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/mahe-pkm/vois.git
cd vois

# 5. Auto-Create .env with correct password
sudo cp .env.example .env
sudo sed -i 's|postgresql://.*|postgresql://vois_admin:Mahezenfone2%40@localhost:5432/vois?schema=public|g' .env

echo "✅ Reset Complete! Database and Files are fresh."
echo "👉 Now run: npx prisma migrate deploy"
```

**🎉 Done! Visit http://your_domain.com**

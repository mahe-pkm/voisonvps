# Deployment Guide: Vois on Hostinger VPS (via Coolify)

**Coolify** is a self-hosting platform that makes deploying Next.js apps as easy as Vercel.  
**Recommended OS**: Ubuntu 24.04 (LTS)

---

## Phase 1: Prepare the VPS

1.  **Go to Hostinger VPS Dashboard**.
2.  Select **"OS & Panel"** > **"Operating System"**.
3.  Choose **Ubuntu 24.04 64bit**.
4.  Click **"Change OS"** (This will format the server and delete old data).
5.  Wait a few minutes for the status to turn **"Running"**.

---

## Phase 2: Install Coolify

1.  **SSH into your server**:
    ```bash
    ssh root@<your-vps-ip>
    ```
2.  **Run the Auto-Install Script**:
    ```bash
    curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
    ```
3.  **Wait**: It takes 5-10 minutes.
4.  **Access Dashboard**:
    *   Once done, open your browser to: `http://<your-vps-ip>:8000`
    *   Create your Admin Account.

---

## Phase 3: Create the Database

1.  In Coolify Dashboard, click **"+ Add Resource"**.
2.  Select **"Database"** > **"PostgreSQL"**.
3.  Use default settings (Version 16 is fine).
4.  Click **"Start"**.
5.  **Copy the Connection String**:
    *   Look for the `postgres://...` URL in the database details.
    *   By default, it uses the internal Docker network name.
    *   **IMPORTANT**: For the Vois app to connect, you will use this internal URL.
    postgres://postgres:CVHWTkQ6ibeNTMDjzDFTI8YEErcEA55nlwejGIZ7Xv33mD0yoihr4NHdRPN7TDfL@ywg88kscw0k0k080gskwwok8:5432/postgres

---

## Phase 4: Deploy Vois Application

1.  **Connect GitHub**:
    *   Go to **"Sources"** > **"Git Sources"** > **"+ Add"**.
    *   Select **GitHub App** and permit access to your `vois` repository.

2.  **Create Project**:
    *   Go to **"Projects"** > **"+ Add"**.
    *   Name it "Vois".
    *   Click **"+ New Resource"** > **"Public Repository"** (or Private if you linked it).
    *   Select the `vois` repo.

3.  **Configuration**:
    *   **Build Pack**: Select **Next.js** or **Nixpacks** (Coolify usually auto-detects Next.js).
    *   **Port**: `3000` (Default).
    *   **Environment Variables**:
        *   Go to **"Environment Variables"** tab.
        *   Add `DATABASE_URL`: Paste the internal Postgres URL from Phase 3.
        *   Add `NEXTAUTH_URL`: `https://<your-vps-ip>` (or your domain).
        *   Add `NEXTAUTH_SECRET`: Generate a random string (e.g. `openssl rand -base64 32`).

4.  **Deploy**:
    *   Click **"Deploy"** in the top right.
    *   Watch the logs. It will auto-install dependencies, generate Prisma client, and build.

---

## Phase 5: Post-Deployment Setup

1.  **Database Migration**:
    *   Coolify doesn't auto-run migrations on first deploy.
    *   Go to the **"Terminal"** tab inside your Application page in Coolify.
    *   Run commands directly in the container:
        ```bash
        npx prisma migrate deploy
        npx prisma db seed
        ```
    *   (If seed fails, you can simple run the SQL command or manual script here too).

2.  **Domain Setup (Recommended)**:
    *   In the Application settings, change functionality `http://<ip>:3000` to your actual domain `https://vois.yourdomain.com`.
    *   Coolify handles the SSL automatically.

---

## Troubleshooting

*   **Build Fails?** Check the "Build Logs". Ensure `DATABASE_URL` is set correctly in secrets so `prisma generate` can run.
*   **App Crashing?** Check "Application Logs".
*   **500/Database Error?** Ensure the database container is running and the URL is correct. It typically looks like `postgresql://postgres:password@unique-db-name:5432/postgres`.

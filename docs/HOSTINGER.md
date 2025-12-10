# Hostinger Deployment Guide (Node.js Web App)

This guide is specifically for **Hostinger Cloud** or **Shared Hosting** users utilizing the **"Node.js Web App"** feature shown in your dashboard.

## ⚠️ Critical Database Requirement
Hostinger's Shared/Cloud plans provide **MySQL/MariaDB** databases by default.
**Vois is built on PostgreSQL.**

To run Vois on Hostinger Shared/Cloud, you **MUST** use an external PostgreSQL database.
**Recommended Free Options:**
- [Neon.tech](https://neon.tech) (Easiest)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

*Note: If you are using a **Hostinger VPS**, you can just install PostgreSQL directly on the server (see standard Deployment Plan).*

---

## 1. Prepare Database (External)

1.  Sign up for **Neon.tech** (or preferred provider).
2.  Create a project named `vois`.
3.  Copy the connection string (it looks like `postgresql://user:pass@host/db...`).
4.  Keep this ready for your `.env` file.

## 2. Prepare Your Code

1.  **Build Locally**:
    ```bash
    npm run build
    ```
2.  **Zip the Project**:
    Create a `vois.zip` containing ONLY:
    - `.next` (folder)
    - `public` (folder)
    - `prisma` (folder)
    - `package.json`
    - `next.config.ts`
    - `.env` (Update this with your **External Database URL**) or just create it on the server.

## 3. Hostinger Setup (hPanel)

1.  **Create the Application**:
    - Go to **Websites** -> **Manage**.
    - Search for **Node.js Web App** in the sidebar.
    - Click **Create Application**.
    - **Version**: Select **v18** or **v20**.
    - **Application Root**: `vois`
    - **Application URL**: `yourdomain.com/`
    - **Startup File**: `server.js` (We will create this).
    - Click **Create**.

2.  **Upload Files**:
    - Click the **File Manager** button.
    - Navigate to the `vois` folder you just created.
    - **Upload** your `vois.zip` and **Extract** it here.
    - Create a file named `server.js` in this folder (see content below).

## 4. The Entry Point (server.js)

Create `server.js` in your `vois` folder. This connects Hostinger's server to Next.js.
*Use the exact code below:*

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = false
const hostname = 'localhost'
const port = process.env.PORT || 3000
// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
```

## 5. Install & Launch

1.  Go back to the **Node.js Web App** page in hPanel.
2.  **Dependency Install**:
    - Click the **"NPM Install"** button (if available).
    - OR click "Enter to Virtual Environment", paste `npm install --production` in the terminal.
3.  **Database Migration**:
    - In the Virtual Environment terminal:
    ```bash
    npx prisma migrate deploy
    ```
    *(This connects to your external Neon/Supabase DB and creates tables)*.
4.  **Restart**:
    - Click **Restart Application**.

## 6. Verification
Visit your domain. You should see the login screen!

---

### Troubleshooting
- **500 Error**: Check `stderr.log` in File Manager.
- **Database Error**: Ensure your `.env` file on the server has the correct External Connection String.

# Shared Hosting Deployment Guide (cPanel)

Deploying Vois to shared hosting is possible **ONLY IF** your hosting provider supports **Node.js** and **PostgreSQL**.

> **Warning**: Standard PHP/MySQL hosting will NOT work. You must have a "Node.js Selector" in cPanel and PostgreSQL database support.

## 1. Prepare Your Local Build

Shared hosting servers often have low memory (RAM), so running `npm run build` there will likely crash. You should build locally.

1.  **Build the project**
    ```bash
    npm run build
    ```

2.  **Create a Production Zip**
    Select and zip the following files/folders:
    - `.next` (Folder)
    - `public` (Folder)
    - `prisma` (Folder)
    - `package.json`
    - `next.config.ts`
    - `.env` (Make sure this has your PRODUCTION credentials)

## 2. Server Setup (cPanel)

1.  **Create Database**
    - Go to **PostgreSQL Databases** in cPanel.
    - Create a database and user.
    - Update your local `.env` with these credentials *before* zipping, or edit it on the server later.

2.  **Setup Node.js App**
    - Go to **Setup Node.js App** in cPanel.
    - Click **Create Application**.
    - **Node.js Version**: Select v18 or v20.
    - **App Root**: `vois` (or your preferred folder name).
    - **Application URL**: `yourdomain.com/`
    - **Startup File**: `node_modules/next/dist/bin/next` (We will configure this later).
    - Click **Create**.

3.  **Upload Files**
    - Go to **File Manager**.
    - Navigate to your App Root (`vois`).
    - Upload and extract your **zip file**.

4.  **Install Production Dependencies**
    - Back in **Setup Node.js App**, click **Enter to the virtual environment** (copy the command).
    - Paste it into your SSH terminal (or use the "Run NPM Install" button if available).
    - Run:
      ```bash
      npm install --production
      ```

5.  **Database Migration**
    - In the terminal (virtual env), run:
      ```bash
      npx prisma migrate deploy
      ```

## 3. Configuring the Entry Point

Next.js is a framework, not a simple script. For cPanel, we need a custom `server.js` to start it properly.

1.  Create a file named `server.js` in your App Root:
    ```javascript
    const { createServer } = require('http')
    const { parse } = require('url')
    const next = require('next')

    const dev = process.env.NODE_ENV !== 'production'
    const hostname = 'localhost'
    const port = process.env.PORT || 3000
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

2.  In **Setup Node.js App**, change **Startup File** to `server.js`.
3.  Click **Restart Application**.

## 4. Troubleshooting

- **503 Service Unavailable**: Check `stderr.log` in your app folder. Usually means a missing dependency or wrong Node version.
- **Images not loading**: Verify `public/uploads` folder exists and has write permissions (755).

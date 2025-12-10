# Vois Installation Guide

This guide provides step-by-step instructions for installing **Vois** on a local Windows/Mac/Linux machine or a VPS.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

### A. Node.js (Runtime)
- **Required Version**: v18.0.0 or higher.
- **Download**: [nodejs.org](https://nodejs.org/)
- **Verify**: Run `node -v` in your terminal.

### B. PostgreSQL (Database)
Vois uses PostgreSQL as its primary database.
- **Windows**: Download the installer from [postgresql.org](https://www.postgresql.org/download/windows/). During install, remember your "superuser" password (usually for user `postgres`).
- **Mac**: Use `brew install postgresql`.
- **Linux/VPS**: `sudo apt install postgresql postgresql-contrib`.

---

## 2. Setting up the Database

1.  Open your Postgres tool (pgAdmin or psql).
2.  Create a new database named `vois`.
    ```sql
    CREATE DATABASE vois;
    ```
3.  (Optional) Create a dedicated user or use the default `postgres`.

---

## 3. Project Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/vois.git
    cd vois
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```
    *Note: If you see peer dependency warnings, you can usually ignore them or use `--legacy-peer-deps`.*

3.  **Configure Environment Variables**
    Duplicate the example file:
    ```bash
    # Windows Command Prompt
    copy .env.example .env
    
    # Mac/Linux/Git Bash
    cp .env.example .env
    ```

4.  **Edit `.env`**
    Open `.env` in a text editor (Notepad, VS Code).
    Update `DATABASE_URL` with your password:
    ```env
    DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vois?schema=public"
    ```
    *Replace `YOUR_PASSWORD` with the one you set during Postgres installation.*

5.  **Initialize Database Schema**
    Run the Prisma migration tool to create tables:
    ```bash
    npx prisma migrate dev --name init
    ```
    *If successful, you will see "Your database is now in sync with your schema".*

---

## 4. Running the Application

1.  **Start Development Server**
    ```bash
    npm run dev
    ```
2.  **Access App**
    Open your browser and navigate to: `http://localhost:3000`

---

## 5. Troubleshooting common issues

### "PrismaClientInitializationError"
- **Cause**: Incorrect database URL or Postgres service is not running.
- **Fix**: Check `DATABASE_URL` in `.env`. Ensure port `5432` is correct. Open Windows Services and ensure "postgresql-x64" is Running.

### "EADDRINUSE: address already in use :::3000"
- **Cause**: Another app is using port 3000.
- **Fix**:
    - Build/Start on a different port: `npm run dev -- -p 3001`
    - Or kill the process using port 3000.

### "Hydration failed" or "Text content does not match"
- **Cause**: Browser extensions (like Grammarly) modifying the DOM.
- **Fix**: Try opening in an Incognito window. Most of these have been fixed in v0.1.0.

### Images not uploading
- **Cause**: Missing permissions on `public/uploads` folder.
- **Fix**: Ensure the folder exists. The app attempts to create it, but sometimes requires manual creation: `mkdir public/uploads`.

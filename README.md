# Vois Admin

![Vois Dashboard]()

**Vois** is a modern, single-tenant invoicing platform designed for small businesses and freelancers. It features multi-profile management, GST compliance, and professional PDF generation, all wrapped in a sleek glassmorphism UI.

## Features

- **Multi-Profile Support**: Manage distinct business entities (e.g., "Tech Corp" and "Freelance") from one admin panel.
- **Dynamic Currency**: Support for global currencies (₹, $, €, £, AED).
- **Professional Invoices**: 3+ Templates (Classic, Modern, Minimal) with automated tax calculations (CGST/SGST/IGST).
- **Local Data Control**: Files (logos, signatures) are stored locally. Data lives in your own PostgreSQL database.
- **Developer Ready**: Built with Next.js 14 App Router, Prisma, and Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL (Local or Cloud)

### Installation
> **New to Node/Postgres?** See our [Detailed Installation Guide](docs/INSTALLATION.md).

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/vois.git
    cd vois
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Update `.env` with your database credentials and a random `NEXTAUTH_SECRET`.

4.  **Database Migration**
    ```bash
    npx prisma migrate dev
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to start invoicing!

## Deployment

Vois is optimized for VPS/Hostinger deployment to support local file uploads.
See [Deployment Plan](docs/deployment.md) or [Shared Hosting Guide](docs/SHARED_HOSTING.md) or [Hostinger VPS Guide](docs/HOSTINGER_VPS.md).

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**Developed by [Dev.Roughclick](https://github.com/dev-roughclick)**

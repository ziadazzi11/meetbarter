# MeetBarter

MeetBarter is a decentralized-ready barter platform designed for economic sovereignty and community resilience. Built with a "Survival Architecture", it prioritizes data ownership, zero-trust governance, and minimal operational costs.

## 🚀 Key Features

- **Economic Sovereignty**: Category-based dynamic escrow and automated market sentiment analysis.
- **Protocol 0 (Kill Switch)**: Administrative emergency freeze for platform-wide protection.
- **Heirloom Protocol**: Time-locked succession mechanism and age-gated asset transfers (e.g., Gia Alkoroum protocol).
- **Survival Architecture**: Uses SQLite and local encrypted vault storage for maximum resilience and $0 infrastructure overhead.
- **Tamper-Evident Ledger**: Cryptographically chained audit logs for institutional-grade accountability.

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS
- **Backend**: NestJS + Prisma
- **Database**: SQLite (No external DB dependency)
- **Security**: AES-256-GCM Encryption + SHA-256 Chained Auditing
- **Infrastructure**: Docker & Docker Compose

## 📂 Project Structure

- `backend/`: NestJS API, Business Logic, and Prisma Schema.
- `frontend/`: Next.js Web Interface.
- `docs/`: Supplementary documentation.

## 🏁 Quick Start

### 1. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit .env with your security codes and encryption keys
```

### 2. Launch with Docker

```bash
docker-compose up --build
```

### 3. Initialize Database

```bash
cd backend
npx prisma db push
npx prisma db seed
```

## 📖 Deployment

For detailed instructions on deploying a "Survival Node", see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🛡️ Governance

Governance is managed through a tiered permission system (User, Moderator, Admin). Critical actions like Master Key rotations and Crisis Overrides are logged in the tamper-evident ledger.

---
© 2026 MeetBarter Foundation. Proprietary and Confidential.

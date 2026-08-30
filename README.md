# CoSpace — Production-Ready Coworking Management Platform

CoSpace is an enterprise-grade full-stack boilerplate for managing and booking coworking spaces. Built with a clean, domain-separated monorepo architecture, CoSpace strictly isolates **Admin** and **Client** frontend and backend applications while operating on a single, 3NF-normalized **PostgreSQL** database.

---

## 🏛️ System Architecture

```text
                                  CoSpace Monorepo
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
                CLIENT                                       ADMIN
                   │                                           │
            ┌──────┴──────┐                             ┌──────┴──────┐
            │             │                             │             │
         Frontend      Backend                       Frontend      Backend
       (Port 5173)   (Port 3001)                   (Port 5174)   (Port 3002)
            │             │                             │             │
            │             ├──────────────► PayMongo     │             ├──────────────► PayMongo
            │             ├──────────────► Cloudinary   │             ├──────────────► Cloudinary
            │             ├──────────────► Resend       │             ├──────────────► Resend
            │             │                             │             │
            │             ▼                             │             ▼
            │         pg Driver                         │         pg Driver
            │             │                             │             │
            └─────────────┼───────────────┬─────────────┴─────────────┘
                          │               │
                          ▼               ▼
                       PostgreSQL Shared Database
                               (Port 5432)
```

---

## 📁 Repository Structure

```text
CoSpace/
├── Admin/
│   ├── Frontend/          # Admin Dashboard (React 18 + Vite + Recharts + React Hook Form)
│   └── Backend/           # Admin REST API (Express + TypeScript + pg Repositories)
│
├── Client/
│   ├── Frontend/          # Client Booking App (React 18 + Vite + React Hook Form + Inline Styles)
│   └── Backend/           # Client REST API (Express + TypeScript + Concurrency-Safe Booking Engine)
│
├── Database/
│   ├── schema/            # Canonical 3NF PostgreSQL schema.sql
│   ├── migrations/        # Sequential SQL migration files
│   ├── seeds/             # Seed data with bcrypt-hashed credentials
│   ├── scripts/           # Migration and seed runner utilities
│   └── backups/           # Database backup storage
│
├── docs/
│   ├── architecture.md    # Domain separation, layers & request flow
│   ├── database.md        # 3NF Schema specifications & ERD
│   ├── api.md             # Complete Admin and Client API endpoints
│   └── deployment.md      # Vercel, Render & Managed Postgres guide
│
├── .gitignore
├── README.md
└── package.json
```

---

## 🚀 Technology Stack

### Frontend (Admin & Client)
- **Framework**: React 18, TypeScript, Vite
- **Routing**: React Router (`react-router-dom` v6)
- **Form Management**: React Hook Form
- **Icons**: Lucide React
- **Charts (Admin)**: Recharts
- **Date Utilities**: date-fns
- **Styling Architecture**: **React Inline Styles** (`style={{ ... }}`) with centralized theme tokens (`theme.ts`, `styles.ts`) and React state for interactive/responsive states.
- **Forbidden Dependencies**: *No Tailwind CSS, No CSS Modules, No Styled Components, No Emotion, No Material UI, No TanStack/React Query, No Zod.*

### Backend (Admin & Client)
- **Runtime**: Node.js, Express.js, TypeScript
- **Database Driver**: `pg` (PostgreSQL connection pool & transactions)
- **Security**: Helmet, CORS, JWT (`jsonwebtoken`), bcrypt (`bcryptjs`)
- **Architecture**: Route → Controller → Validator → Service → Repository → `pg`
- **Forbidden Dependencies**: *No Prisma, No TypeORM, No Zod.*

---

## ⚙️ Ports & Service URLs

| Service | Port | Local URL |
| :--- | :--- | :--- |
| **Client Frontend** | `5173` | `http://localhost:5173` |
| **Client Backend** | `3001` | `http://localhost:3001` (Health: `/health`) |
| **Admin Frontend** | `5174` | `http://localhost:5174` |
| **Admin Backend** | `3002` | `http://localhost:3002` (Health: `/health`) |
| **PostgreSQL DB** | `5432` | `localhost:5432/cospace_db` |

---

## 🔑 Default Development Credentials

The seed script creates the following pre-configured test users:

- **Admin Account**:
  - Email: `admin@cospace.com`
  - Password: `Admin@123456`
  - Role: `superadmin`
- **Client Account**:
  - Email: `client@cospace.com`
  - Password: `Client@123456`

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14

### 2. Installation
Install dependencies across the monorepo:
```bash
npm install
npm install --prefix Admin/Frontend
npm install --prefix Admin/Backend
npm install --prefix Client/Frontend
npm install --prefix Client/Backend
```

### 3. Environment Variables
Copy `.env.example` to `.env` in all four projects:
```bash
# Admin
cp Admin/Frontend/.env.example Admin/Frontend/.env
cp Admin/Backend/.env.example Admin/Backend/.env

# Client
cp Client/Frontend/.env.example Client/Frontend/.env
cp Client/Backend/.env.example Client/Backend/.env
```

### 4. Database Setup
Ensure PostgreSQL is running, then run migrations and seeds:
```bash
npm run db:migrate
npm run db:seed
```

### 5. Running the Applications
Run all four applications simultaneously:
```bash
npm run dev
```

Or run Admin or Client suites individually:
```bash
npm run dev:admin    # Launches Admin Frontend (5174) & Backend (3002)
npm run dev:client   # Launches Client Frontend (5173) & Backend (3001)
```

---

## 📚 Documentation
- [Architecture Deep-Dive](docs/architecture.md)
- [Database Schema & ERD](docs/database.md)
- [API Specifications](docs/api.md)
- [Deployment Guide](docs/deployment.md)

---

## 📄 License
MIT © 2026 CoSpace

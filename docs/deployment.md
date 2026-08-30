# CoSpace Deployment Guide

This guide details the deployment architecture for CoSpace across managed cloud providers.

---

## 1. Cloud Architecture Overview

- **Frontends (Vercel)**:
  - `Admin/Frontend` → Deployed to dedicated subdomain (e.g. `https://admin.cospace.com`)
  - `Client/Frontend` → Deployed to root domain (e.g. `https://cospace.com`)
- **Backends (Render / AWS ECS / Railway)**:
  - `Admin/Backend` → Deployed as independent web service (`https://admin-api.cospace.com`)
  - `Client/Backend` → Deployed as independent web service (`https://api.cospace.com`)
- **Database (Managed PostgreSQL - AWS RDS / Supabase / Neon / Render Postgres)**:
  - Shared PostgreSQL instance accessed securely via connection pooling.

---

## 2. Environment Variables

### Admin Backend
```ini
PORT=3002
NODE_ENV=production
DATABASE_URL=postgres://user:password@host:5432/cospace_prod?sslmode=require
JWT_SECRET=super_secure_admin_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
PAYMONGO_SECRET_KEY=sk_live_...
PAYMONGO_PUBLIC_KEY=pk_live_...
CLOUDINARY_CLOUD_NAME=cospace-media
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=re_...
GOOGLE_MAPS_API_KEY=AIza...
ADMIN_URL=https://admin.cospace.com
```

### Client Backend
```ini
PORT=3001
NODE_ENV=production
DATABASE_URL=postgres://user:password@host:5432/cospace_prod?sslmode=require
JWT_SECRET=super_secure_client_jwt_secret_min_32_chars
JWT_EXPIRES_IN=30d
PAYMONGO_SECRET_KEY=sk_live_...
PAYMONGO_PUBLIC_KEY=pk_live_...
CLOUDINARY_CLOUD_NAME=cospace-media
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=re_...
GOOGLE_MAPS_API_KEY=AIza...
CLIENT_URL=https://cospace.com
```

### Admin Frontend
```ini
VITE_ADMIN_API_URL=https://admin-api.cospace.com/api/admin
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

### Client Frontend
```ini
VITE_CLIENT_API_URL=https://api.cospace.com/api/client
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

---

## 3. Database Migration Steps on Deployment

In your CI/CD pipeline or release command:
```bash
# Execute schema migrations
npm run db:migrate
```

Never run `seed.js` in production environments.

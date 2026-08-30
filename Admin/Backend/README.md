# CoSpace Admin Backend

The Admin Backend provides dedicated administrative REST APIs for managing bookings, clients, workspaces, analytics, and operational settings for CoSpace.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start in development mode with live watch
npm run dev

# Run unit tests
npm run test

# Build production bundle
npm run build
```

---

## 📡 Endpoints Summary

- **Health Check**: `GET /health`
- **Authentication**: `/api/admin/auth` (`/login`, `/me`, `/logout`)
- **Dashboard**: `/api/admin/dashboard` (`/kpis`, `/analytics`, `/recent-activity`)
- **Bookings**: `/api/admin/bookings` (`/`, `/:id`, `/:id/status`, `/:id/reschedule`)
- **Clients**: `/api/admin/clients` (`/`, `/:id`, `/:id/status`)
- **Workspaces**: `/api/admin/workspaces` (`/`, `/:id`, `/:id/status`, `/meta/types-and-amenities`)
- **Payments**: `/api/admin/payments` (`/`, `/:id`, `/:id/refund`)
- **Reports**: `/api/admin/reports` (`/`)

# CoSpace Client Backend

The Client Backend provides member-facing REST APIs and a concurrency-safe booking engine for CoSpace members.

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
- **Authentication**: `/api/client/auth` (`/register`, `/login`, `/me`, `/logout`)
- **Workspaces Catalog**: `/api/client/workspaces` (`/`, `/:id`, `/:id/availability`)
- **Bookings Engine**: `/api/client/bookings` (`/`, `/:id`, `/:id/cancel`)
- **Payment Settlement**: `/api/client/payments` (`/create-intent`, `/confirm`, `/webhook`)
- **Member Profile**: `/api/client/profile` (`/`, `/preferences`)
- **Favorites**: `/api/client/favorites` (`/`, `/:workspaceId`)
- **Notifications**: `/api/client/notifications` (`/`, `/:id/read`)

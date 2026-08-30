# CoSpace System Architecture

## 1. Domain Separation Overview

CoSpace adopts a strict domain-separated monorepo architecture. Unlike monolithic platforms that combine client and administration portals into one codebase or single Express backend, CoSpace enforces clear runtime and code boundaries:

1. **Client Domain**: Dedicated to registered/prospective coworking members for browsing inventory, checking live availability, booking desk/office slots, making payments, managing active reservations, and accessing check-in QR codes.
2. **Admin Domain**: Dedicated to space operators, receptionists, and managers for inventory management, member directory, booking overrides, revenue analytics, refund approvals, and operational settings.

```text
                               ┌─────────────────────────┐
                               │     Shared Database     │
                               │  (PostgreSQL 3NF Schema)│
                               └────────────┬────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
         ┌─────────────────────┐                         ┌─────────────────────┐
         │    Client Backend   │                         │    Admin Backend    │
         │    (Port: 3001)     │                         │    (Port: 3002)     │
         │  Client Auth & APIs │                         │  Admin Auth & APIs  │
         └──────────▲──────────┘                         └──────────▲──────────┘
                    │                                               │
                    │                                               │
         ┌──────────┴──────────┐                         ┌──────────┴──────────┐
         │   Client Frontend   │                         │   Admin Frontend    │
         │    (Port: 5173)     │                         │    (Port: 5174)     │
         └─────────────────────┘                         └─────────────────────┘
```

---

## 2. Backend Layering Architecture

Both `Admin/Backend` and `Client/Backend` enforce a 6-tier layered architecture:

```text
HTTP Request
     │
     ▼
[ Routes ] ────────────► Route definitions, URL parameters, middleware binding
     │
     ▼
[ Middlewares ] ───────► Authentication (JWT), Authorization (Role/Ownership), CORS, Helmet
     │
     ▼
[ Controllers ] ───────► Request parsing, HTTP response formatting (thin layer)
     │
     ▼
[ Validators ] ────────► Pure TypeScript validation functions (No Zod)
     │
     ▼
[ Services ] ──────────► Business logic, transaction orchestration, pricing calculation, concurrency checks
     │
     ▼
[ Repositories ] ──────► Raw SQL parameterized queries using pg Pool (No ORMs / No Prisma)
     │
     ▼
PostgreSQL Database
```

---

## 3. Database Access & Concurrency Control

### Parameterized SQL Queries
Every repository strictly executes parameterized SQL statements using PostgreSQL placeholders (`$1`, `$2`, etc.) to eliminate SQL injection risks.

### Atomic Booking Engine
Double-booking is prevented at the database and transaction level. When a client initiates a booking:
1. A transaction begins (`BEGIN`).
2. An exclusive lock on overlapping workspace reservation intervals is evaluated (`SELECT FOR UPDATE` or interval collision check).
3. If free, the booking record is created along with itemized addons and initial status history.
4. Transaction commits (`COMMIT`).
5. If a collision is detected, transaction rolls back (`ROLLBACK`) and returns a `BOOKING_CONFLICT` error.

---

## 4. Frontend Design Architecture

Both frontend applications utilize a design system built purely on **React Inline Styles** and standard React state primitives:

- **Design System**: Global theme tokens located in `src/theme/theme.ts` providing color scales, elevations, borders, and typography.
- **Helper Styles**: Compositional styling helpers located in `src/theme/styles.ts`.
- **Interactivity**: Dynamic states (`hover`, `focus`, `active`, `expanded`) are handled via React state (`useState`), ensuring zero reliance on CSS pseudo-classes or external CSS preprocessors.
- **State Management**: React `useState`, `useReducer`, `useMemo`, `useCallback`, and `useContext` for centralized session and UI states.
- **API Services**: Centralized Axios/fetch wrappers in `src/api/` encapsulating authentication token injection and standard response formatting.

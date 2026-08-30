# CoSpace API Specifications

CoSpace provides two completely decoupled REST APIs:
- **Admin API**: `http://localhost:3002/api/admin`
- **Client API**: `http://localhost:3001/api/client`

---

## 1. Response Envelope Format

### Standard Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

### Standard Error Response:
```json
{
  "success": false,
  "message": "Detailed error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## 2. Health Endpoints

- **Admin Backend**: `GET /health`
  ```json
  {
    "success": true,
    "service": "admin-backend",
    "status": "healthy"
  }
  ```
- **Client Backend**: `GET /health`
  ```json
  {
    "success": true,
    "service": "client-backend",
    "status": "healthy"
  }
  ```

---

## 3. Admin API Endpoints (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Administrator login | No |
| `GET` | `/auth/me` | Current admin identity | Yes (Admin JWT) |
| `POST` | `/auth/logout` | Revoke session | Yes (Admin JWT) |
| `GET` | `/dashboard/kpis` | Summary cards (Revenue, Bookings, Occupancy) | Yes (Admin JWT) |
| `GET` | `/dashboard/analytics` | Recharts data for revenue & booking trends | Yes (Admin JWT) |
| `GET` | `/dashboard/recent-activity` | Live activity feed | Yes (Admin JWT) |
| `GET` | `/bookings` | List bookings with filters and pagination | Yes (Admin JWT) |
| `GET` | `/bookings/:id` | Detailed booking information | Yes (Admin JWT) |
| `PATCH` | `/bookings/:id/status` | Confirm, activate, complete, or cancel booking | Yes (Admin JWT) |
| `POST` | `/bookings/:id/reschedule` | Move booking dates | Yes (Admin JWT) |
| `GET` | `/clients` | List clients with search & filter | Yes (Admin JWT) |
| `GET` | `/clients/:id` | Client profile, history & total spend | Yes (Admin JWT) |
| `PATCH` | `/clients/:id/status` | Suspend or reactivate client | Yes (Admin JWT) |
| `GET` | `/workspaces` | List all workspaces | Yes (Admin JWT) |
| `POST` | `/workspaces` | Create new workspace | Yes (Admin JWT) |
| `GET` | `/workspaces/:id` | Workspace details | Yes (Admin JWT) |
| `PUT` | `/workspaces/:id` | Update workspace | Yes (Admin JWT) |
| `PATCH` | `/workspaces/:id/status` | Set status (available/maintenance/inactive) | Yes (Admin JWT) |
| `GET` | `/payments` | List payments and transactions | Yes (Admin JWT) |
| `POST` | `/payments/:id/refund` | Issue payment refund | Yes (Admin JWT) |
| `GET` | `/reports` | Detailed reports by date range | Yes (Admin JWT) |
| `GET` | `/settings` | System configuration settings | Yes (Admin JWT) |
| `PUT` | `/settings` | Update system configuration | Yes (Admin JWT) |

---

## 4. Client API Endpoints (`/api/client`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new client account | No |
| `POST` | `/auth/login` | Member authentication | No |
| `GET` | `/auth/me` | Fetch active client profile | Yes (Client JWT) |
| `POST` | `/auth/logout` | Member logout | Yes (Client JWT) |
| `GET` | `/workspaces` | Browse active workspaces | No |
| `GET` | `/workspaces/:id` | Workspace details & amenities | No |
| `POST` | `/workspaces/:id/availability`| Check date/time slot availability | No |
| `POST` | `/bookings` | Create booking (Transactional lock) | Yes (Client JWT) |
| `GET` | `/bookings` | List authenticated client's bookings | Yes (Client JWT) |
| `GET` | `/bookings/:id` | View booking receipt and check-in QR | Yes (Client JWT) |
| `POST` | `/bookings/:id/cancel` | Cancel booking | Yes (Client JWT) |
| `POST` | `/bookings/:id/reschedule` | Request date change | Yes (Client JWT) |
| `POST` | `/payments/create-intent` | Initialize PayMongo payment | Yes (Client JWT) |
| `POST` | `/payments/confirm` | Confirm payment result | Yes (Client JWT) |
| `POST` | `/payments/webhook` | PayMongo asynchronous webhook handler | Provider Signature |
| `GET` | `/profile` | Get full client profile & preferences | Yes (Client JWT) |
| `PUT` | `/profile` | Update profile information | Yes (Client JWT) |
| `GET` | `/favorites` | List bookmarked workspaces | Yes (Client JWT) |
| `POST` | `/favorites/:workspaceId` | Toggle bookmark | Yes (Client JWT) |
| `GET` | `/notifications` | List user notifications | Yes (Client JWT) |
| `PATCH` | `/notifications/:id/read` | Mark notification as read | Yes (Client JWT) |
| `POST` | `/reviews` | Submit workspace review | Yes (Client JWT) |

# CoSpace — Master Agent Instructions

You are an AI software engineering agent working on **CoSpace**, a production-ready coworking space booking and workspace management platform.

These instructions are the **universal rules for every AI agent working inside the CoSpace repository**.

Specialist instructions under `.agents/` provide additional domain-specific rules for Frontend, Backend, Database, and QA work.

---

# 1. Project Context

CoSpace is a full-stack coworking-space booking and workspace management platform.

## System Architecture

```text
CoSpace/
│
├── Client/
│   ├── Frontend/       ← Client-facing web application
│   └── Backend/        ← Client REST API
│
├── Admin/
│   ├── Frontend/       ← Admin dashboard
│   └── Backend/        ← Admin REST API
│
├── Database/           ← PostgreSQL schema, migrations, seeds
│
├── .agents/            ← AI engineering instructions
│
└── .env.example
```

### Client Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router
* TanStack Query
* React Hook Form
* Zod
* Lucide React

### Admin Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router
* TanStack Query
* Recharts
* Lucide React

### Client Backend

* Node.js
* Express.js
* TypeScript
* REST API
* Zod
* JWT
* bcrypt/bcryptjs
* PostgreSQL via `pg`
* PayMongo
* Cloudinary
* Resend
* Google Maps

### Admin Backend

* Node.js
* Express.js
* TypeScript
* REST API
* Zod
* JWT
* bcrypt/bcryptjs
* PostgreSQL via `pg`
* Analytics
* Workspace/inventory management

### Database

* PostgreSQL
* 3NF relational schema
* SQL migrations
* Seed data
* `pg.Pool`
* Referential integrity
* Transactional consistency

---

# 2. Universal Agent Rules

Every agent MUST follow these rules.

## 2.1 Inspect Before Modifying

Before changing code, database, configuration, or dependencies:

1. Inspect the repository structure.
2. Locate the relevant files.
3. Read the existing implementation.
4. Identify dependencies and callers.
5. Understand the current data/API flow.
6. Check existing tests.
7. Check environment/configuration requirements.
8. Determine whether the requested functionality already exists.

Never assume that a file, component, endpoint, table, dependency, migration, or feature exists.

---

# 3. Repository Is the Source of Truth

The active repository is the authoritative source of truth.

Do not blindly implement assumptions from:

* this prompt
* old documentation
* previous versions
* generic architecture patterns
* AI-generated suggestions

If the repository differs from this document, inspect the actual implementation first.

When there is a conflict:

```text
Actual working repository
        ↓
Explicit current user requirement
        ↓
Specialist instructions
        ↓
General architectural assumptions
```

Do not force the repository into an imagined architecture.

---

# 4. Preserve Existing Work

Never destroy existing work unnecessarily.

Do NOT:

* delete working features without authorization
* rewrite entire files when targeted edits are sufficient
* replace an existing architecture without justification
* remove dependencies without checking usage
* overwrite unrelated changes
* reset Git history
* force push
* delete branches
* drop production/staging database tables without authorization
* replace working implementations merely because another approach is preferred

If existing code works, **extend and improve it instead of rebuilding it from scratch**.

---

# 5. Minimal Safe Changes

Prefer:

```text
Small change
+
Clear purpose
+
Existing architecture
+
Minimal regression risk
```

Avoid unnecessary:

* abstractions
* dependencies
* architecture rewrites
* new frameworks
* duplicate utilities
* duplicate API clients
* duplicate database logic
* unnecessary design patterns

Do not overengineer simple requirements.

---

# 6. Plan Before Major Changes

For multi-layer or architectural changes, first determine:

```text
Requirement
    ↓
Affected Frontend
    ↓
Affected Backend
    ↓
Affected Database
    ↓
Affected Integrations
    ↓
Affected Tests
    ↓
Implementation
    ↓
Verification
```

Major changes should consider the complete dependency chain.

Examples:

* Database schema change → Backend queries → API → Frontend → Tests
* API change → Backend contract → Frontend consumers → Tests
* Authentication change → Middleware → Routes → Frontend auth state → Tests
* Booking change → Database concurrency → Backend service → Frontend UX → QA

---

# 7. Specialist Agent Directory

When domain-specific expertise is required, use the appropriate specialist instructions.

```text
.agents/

├── Instructions.md
├── Senior_Frontend.md
├── Senior_Backend.md
├── Database_Specialist.md
└── Senior_Tester.md
```

## Specialist Responsibilities

### Database Specialist

Responsible for:

* PostgreSQL
* 3NF schema
* constraints
* relationships
* migrations
* seeds
* indexes
* transactions
* concurrency
* data integrity
* database performance

### Senior Backend

Responsible for:

* REST APIs
* business logic
* authentication
* authorization
* booking engine
* pricing
* integrations
* backend validation
* service/repository logic

### Senior Frontend

Responsible for:

* React UI
* UX
* routing
* forms
* client-side validation
* TanStack Query
* responsive behavior
* accessibility
* loading/error/empty states

### Senior Tester

Responsible for:

* functional testing
* regression testing
* integration testing
* E2E testing
* API testing
* database validation
* security testing
* concurrency testing
* PASS/FAIL decisions

---

# 8. Layer Authority

CoSpace follows this authority model:

```text
Database
   ↓
Persistent Data Integrity

Backend
   ↓
Business Logic Authority

Frontend
   ↓
User Experience

QA
   ↓
Independent Verification
```

## Database Authority

The database is responsible for:

* data integrity
* relational integrity
* constraints
* transactions
* persistence consistency
* concurrency mechanisms where appropriate

## Backend Authority

The backend is the **authoritative business logic layer**.

The backend must control:

* pricing
* availability
* authorization
* booking rules
* booking state transitions
* payment state
* business validation

Never trust:

* client-supplied prices
* client-supplied roles
* client-supplied permissions
* client-supplied availability
* client-supplied payment status

## Frontend Authority

The frontend is responsible for:

* presentation
* user interaction
* client-side validation
* UX feedback
* API consumption
* loading/error/empty/success states

Frontend validation improves UX but is **not a security boundary**.

## QA Authority

QA independently determines whether implemented behavior actually works.

Passing compilation or static inspection alone does not establish correctness.

---

# 9. Cross-Layer Change Rules

If a task affects multiple layers:

1. Identify all affected layers.
2. Inspect each layer before modifying it.
3. Maintain consistent contracts.
4. Update dependent tests.
5. Verify the complete flow.

Never fix a backend problem by hiding it in the frontend.

Never weaken database constraints simply to make an API request succeed.

Never modify tests merely to make incorrect behavior pass.

---

# 10. Security Requirements

Security is mandatory across the entire system.

## Authentication

Use:

* JWT with expiration
* secure password hashing
* bcrypt/bcryptjs

Passwords must never be:

* stored plaintext
* logged
* returned by APIs
* exposed to frontend code

Use a minimum bcrypt cost of 10 rounds unless the existing implementation establishes a stronger secure configuration.

---

# 11. Authorization

Every protected operation must verify authorization server-side.

Authorization must consider:

```text
Authenticated identity
+
Role
+
Resource ownership
+
Requested operation
```

Never trust a role supplied by:

* frontend state
* request body
* query parameters
* URL parameters

The backend must derive authorization from trusted authentication data and database state where necessary.

Be alert for:

* IDOR
* BOLA
* privilege escalation
* cross-user data access
* cross-admin/client access
* unauthorized modification

---

# 12. Input Validation

All externally supplied data must be validated.

Validate:

* request body
* query parameters
* route parameters
* relevant headers
* webhook payloads

Use Zod where established by the backend architecture.

TypeScript types alone are not runtime validation.

Invalid input should produce controlled application errors rather than:

* PostgreSQL errors
* stack traces
* crashes
* malformed responses

---

# 13. SQL Security

All application SQL must use parameterized queries.

Correct:

```ts
pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

Never construct SQL using raw user input.

Protect against:

* SQL injection
* unsafe dynamic SQL
* mass updates
* unintended deletes

If dynamic identifiers are required, use an explicit allowlist.

---

# 14. Error Handling

API errors must be safe and predictable.

Never expose:

* stack traces
* SQL statements
* database credentials
* internal paths
* database connection information
* raw PostgreSQL errors

Use the application's established structured error format.

Where applicable, distinguish:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

Do not return HTTP 500 for expected business conflicts.

---

# 15. CORS & Security Headers

Backend services should use:

* `helmet`
* strict CORS configuration
* explicit allowed frontend origins

Expected origins may include:

```text
CLIENT_FRONTEND_URL
ADMIN_FRONTEND_URL
```

Do not use unrestricted production CORS unless explicitly required.

---

# 16. Booking Integrity

Booking is a critical business domain.

The system must protect against double-booking even when multiple requests arrive simultaneously.

Overlap logic:

```sql
existing.start_time < requested.end_time
AND existing.end_time > requested.start_time
```

These statuses must block overlapping reservations when they are active booking states in the current implementation:

```text
pending
confirmed
active
```

Adjacent reservations remain valid:

```text
10:00 → 11:00
11:00 → 12:00
```

They do not overlap.

---

# 17. Booking Concurrency

Availability checks must not depend solely on frontend behavior.

The backend/database must safely handle:

* simultaneous requests
* identical booking requests
* partial overlaps
* containment overlaps
* pending conflicts
* confirmed conflicts
* active conflicts

For simultaneous identical requests:

```text
Request A → SUCCESS
Request B → CONFLICT
```

Only one reservation should succeed for the same unavailable resource/time interval.

Use appropriate:

* transactions
* row locks
* database constraints
* atomic operations

depending on the existing architecture.

---

# 18. Pricing Authority

The backend is the sole authority for final booking pricing.

The frontend may display estimated prices, but the backend must recalculate or verify:

* hourly pricing
* daily pricing
* duration
* add-ons
* discounts
* fees
* final totals

Never trust a client-provided `total_price`.

---

# 19. Booking State Integrity

Booking status must follow the application's defined lifecycle.

For example:

```text
pending
   ↓
confirmed
   ↓
active
   ↓
completed
```

Cancellation may be permitted from specific states.

Do not allow arbitrary status values.

Do not introduce new booking states without understanding their impact on:

* database constraints
* backend logic
* availability
* payments
* frontend UI
* QA tests

---

# 20. Database Rules

The PostgreSQL database must maintain:

* primary keys
* foreign keys
* unique constraints
* CHECK constraints
* NOT NULL constraints
* indexes
* referential integrity
* appropriate normalization

The schema should follow 3NF where practical.

Do not duplicate data unnecessarily.

Do not store relational lists as comma-separated strings.

Use proper junction tables for many-to-many relationships.

---

# 21. Migration Safety

Database changes must use migrations.

Never directly modify a production database to make a feature work.

Before creating a migration:

1. Inspect the current schema.
2. Inspect existing migrations.
3. Check dependent queries.
4. Check seed data.
5. Check affected tests.
6. Determine migration compatibility.

Never silently destroy existing data.

Never modify an already-applied migration to rewrite production history unless explicitly authorized.

---

# 22. Environment & Secrets

CoSpace may use environment variables such as:

```text
DATABASE_URL
JWT_SECRET
PAYMONGO_SECRET_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY

VITE_CLIENT_API_URL
VITE_ADMIN_API_URL
VITE_GOOGLE_MAPS_API_KEY
```

Treat the repository's actual environment configuration as authoritative.

Never expose backend secrets through frontend code.

Never commit:

```text
.env
```

or production secrets.

Frontend code should only access intentionally public `VITE_*` values.

Never assume an environment variable exists without checking the repository.

---

# 23. Ports

The expected local development ports are:

```text
Client Frontend  → 5173
Admin Frontend   → 5174
Client Backend   → 3001
Admin Backend    → 3002
PostgreSQL       → 5432
```

These are defaults, not absolute assumptions.

Always inspect the actual project configuration before changing ports.

Do not hardcode production URLs into source code.

---

# 24. API Contract Integrity

Do not invent API endpoints.

Before consuming or modifying an endpoint, verify:

* HTTP method
* URL
* authentication requirement
* request body
* query parameters
* path parameters
* response structure
* error structure
* status codes

If the frontend and backend disagree, identify the actual contract and correct the appropriate layer.

Do not silently create duplicate endpoints to work around a contract mismatch.

---

# 25. Frontend State Rules

Frontend applications should distinguish between:

### Server State

Use TanStack Query for appropriate server data.

Examples:

* workspaces
* bookings
* availability
* users
* analytics

### Local UI State

Use local React state or appropriate UI mechanisms for:

* modals
* filters
* form steps
* dropdowns
* temporary UI selections

Do not unnecessarily duplicate server state in multiple stores.

After mutations, ensure affected cached data is correctly invalidated or updated.

---

# 26. Critical Mutation UX

For critical operations such as:

* booking
* payment
* cancellation
* refund
* admin modifications

Do not assume the operation succeeded before the backend confirms it.

Prevent accidental duplicate submissions.

When a booking returns:

```text
409 Conflict
```

the frontend should communicate that availability changed and refresh/revalidate availability when appropriate.

Do not automatically retry critical booking/payment operations unless the operation is explicitly idempotent.

---

# 27. Frontend Security

Never expose:

* backend secrets
* database credentials
* PayMongo secret keys
* Cloudinary API secrets
* Resend API keys
* JWT secrets

Do not trust frontend-only role checks for security.

Protected frontend routes are a UX mechanism.

Backend authorization remains the actual security boundary.

---

# 28. Accessibility & UX

Frontend implementations should provide:

* semantic HTML
* keyboard accessibility
* visible focus states
* proper labels
* accessible error messages
* appropriate modal focus behavior
* adequate contrast
* non-color-only status indicators
* responsive layouts

Interactive controls should generally have sufficiently large touch targets.

All important UI flows should handle:

```text
Loading
Error
Empty
Success
```

---

# 29. Testing Rules

Never consider a feature complete merely because it compiles.

Where applicable, verify:

```text
Unit Tests
Integration Tests
API Tests
Database Tests
Concurrency Tests
Frontend Tests
E2E Tests
Build
```

Tests must include:

* happy paths
* invalid inputs
* boundary conditions
* authorization failures
* duplicate operations
* concurrency
* database integrity
* regression scenarios

Never delete or weaken tests simply because they expose a defect.

---

# 30. Evidence-Based Verification

Agents must distinguish between what they **know** and what they **assume**.

Use these verification levels:

### VERIFIED

The behavior was actually executed and confirmed.

### OBSERVED IN CODE

The implementation appears correct from source inspection but was not executed.

### NOT VERIFIED

There is insufficient evidence.

### INFERRED

The conclusion is based on assumptions.

Never report an `INFERRED` or `OBSERVED IN CODE` result as `VERIFIED`.

---

# 31. Debugging Protocol

When fixing a defect:

```text
1. Reproduce
      ↓
2. Collect evidence
      ↓
3. Trace the request/data flow
      ↓
4. Identify the responsible layer
      ↓
5. Identify root cause
      ↓
6. Apply minimal fix
      ↓
7. Reproduce the original scenario
      ↓
8. Run regression tests
      ↓
9. Verify affected layers
      ↓
10. Report evidence
```

Do not change random files until the root cause is understood.

---

# 32. Root-Cause Requirement

When a bug is discovered, identify the actual cause.

Do not stop at the first visible symptom.

Example:

```text
Frontend shows booking failure
        ↓
API returns 500
        ↓
Database throws constraint error
        ↓
Backend failed to validate input
        ↓
ROOT CAUSE
```

The correct fix should address the root cause rather than merely hiding the error.

---

# 33. Dependency Management

Before adding a dependency:

1. Check whether the functionality already exists.
2. Check whether an existing package can solve it.
3. Check compatibility with the current project.
4. Confirm that the dependency is actually necessary.

Do not add libraries simply for convenience.

Before removing a dependency:

* search the entire monorepo
* verify all workspaces
* verify scripts/configuration
* verify tests

---

# 34. Git Safety

Never automatically:

```bash
git reset --hard
git clean -fd
git push --force
git branch -D
```

unless explicitly authorized.

Never overwrite uncommitted user work.

Before large modifications, understand the current working tree when Git information is available.

Do not rewrite history to solve normal development problems.

---

# 35. Production Safety

Treat production and staging environments as protected environments.

Never perform destructive operations without explicit authorization.

Examples:

```text
DROP DATABASE
DROP TABLE
TRUNCATE
DELETE FROM
DROP COLUMN
```

Before destructive operations:

* confirm environment
* confirm target
* understand dependencies
* verify backup/recovery strategy
* obtain authorization

---

# 36. Deployment Awareness

When making deployment-related changes, verify:

* production API URLs
* CORS origins
* frontend environment variables
* backend environment variables
* database connection configuration
* build commands
* runtime start commands
* ports
* health endpoints where applicable

Never leave:

```text
localhost
127.0.0.1
development secrets
```

hardcoded into production configuration.

---

# 37. No Fake Success

Never claim:

* "fixed"
* "working"
* "tested"
* "production-ready"
* "verified"

without sufficient evidence.

If you cannot execute a required test, say so.

Example:

```text
Build: VERIFIED
Unit tests: VERIFIED
Production deployment: NOT VERIFIED
```

Accuracy is more important than appearing successful.

---

# 38. Definition of Done

A task is complete only when:

* [ ] Requirement is understood
* [ ] Existing implementation was inspected
* [ ] Correct layer was identified
* [ ] Minimal change was implemented
* [ ] No unrelated functionality was modified
* [ ] Security implications were considered
* [ ] API contracts remain consistent
* [ ] Database integrity is preserved
* [ ] Booking concurrency is safe where applicable
* [ ] Existing tests were preserved
* [ ] Relevant tests were executed
* [ ] Builds were executed where applicable
* [ ] Regression impact was checked
* [ ] Environment/configuration impact was checked
* [ ] Results are accurately reported

---

# 39. Standard Verification Commands

Use the repository's actual scripts when available.

Common commands may include:

```bash
npm run test
npm run build
npm run lint
npm run db:migrate
npm run db:seed
```

Do not assume these scripts exist.

Inspect `package.json` before running or reporting them.

For individual workspaces, use the appropriate workspace-specific commands.

---

# 40. Standard Agent Workflow

Every task should follow:

```text
UNDERSTAND
    ↓
INSPECT
    ↓
PLAN
    ↓
IMPLEMENT
    ↓
TEST
    ↓
VERIFY
    ↓
REPORT
```

For complex tasks:

```text
Requirement
    ↓
Repository Inspection
    ↓
Architecture Analysis
    ↓
Impact Analysis
    ↓
Implementation Plan
    ↓
Targeted Changes
    ↓
Unit/Integration Testing
    ↓
Cross-Layer Verification
    ↓
Regression Testing
    ↓
Final Report
```

---

# 41. Standard Agent Response

After completing a coding task, provide:

## Changes Made

Briefly describe what was changed and why.

## Files Changed

List every modified, created, or deleted file.

## Verification

Report:

* tests executed
* build results
* lint results
* manual verification
* database verification
* API verification

Clearly distinguish:

```text
VERIFIED
OBSERVED IN CODE
NOT VERIFIED
```

## Environment / Database Changes

Mention:

* new environment variables
* changed environment variables
* migrations
* schema changes
* seed changes
* deployment configuration changes

## Remaining Issues

If anything could not be verified or remains unresolved, explicitly state it.

---

# 42. Final Engineering Principles

Always prioritize:

```text
Correctness
    ↓
Security
    ↓
Data Integrity
    ↓
Reliability
    ↓
Maintainability
    ↓
Performance
    ↓
User Experience
```

Do not sacrifice correctness for speed.

Do not sacrifice security for convenience.

Do not sacrifice database integrity for frontend convenience.

Do not hide backend defects inside frontend code.

Do not claim verification without evidence.

Do not overengineer.

Do not destroy existing work.

**Inspect first. Understand the system. Make the smallest safe change. Test it. Verify it. Report the truth.**

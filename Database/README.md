# CoSpace Database Layer

The `Database/` directory is the canonical source of truth for the entire CoSpace platform.

---

## 📁 Structure

```text
Database/
├── schema/
│   └── schema.sql       # Canonical 3NF PostgreSQL DDL
├── migrations/
│   ├── 001_create_all_tables.sql
│   └── 002_create_indexes_and_triggers.sql
├── seeds/
│   └── seed.sql         # Seed data with development test accounts
├── scripts/
│   ├── migrate.js       # Migration runner
│   ├── seed.js          # Seed runner
│   └── reset.js         # Complete rebuild and reseed
└── backups/             # Backup storage
```

---

## 🚀 Commands

Run these commands from the root of the repository:

```bash
# Run all pending migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Drop all tables, recreate schema and seed
npm run db:reset
```

---

## 🔐 Development Credentials

- **Superadmin**: `admin@cospace.com` / `Admin@123456`
- **Client**: `client@cospace.com` / `Client@123456`

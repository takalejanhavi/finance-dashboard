# FinBoard — Finance Dashboard

A production-quality full-stack finance dashboard with role-based access control, analytics, and clean architecture.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│  Auth │ Dashboard │ Records │ Analytics │ Admin     │
│              (Vite + Tailwind + Recharts)            │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / Axios
┌────────────────────▼────────────────────────────────┐
│                  NestJS Backend                      │
│  ┌──────────────────────────────────────────────┐   │
│  │            Global Guards Layer               │   │
│  │        JwtAuthGuard + RolesGuard             │   │
│  └──────────────────────────────────────────────┘   │
│  ┌───────────┐ ┌─────────┐ ┌──────────┐ ┌───────┐  │
│  │   Auth    │ │  Users  │ │ Records  │ │Analyt.│  │
│  │ Controller│ │ Ctrl.   │ │ Ctrl.    │ │ Ctrl. │  │
│  │  Service  │ │ Service │ │ Service  │ │ Svc.  │  │
│  │   Repo.   │ │  Repo.  │ │  Repo.   │ │ Repo. │  │
│  └───────────┘ └─────────┘ └──────────┘ └───────┘  │
│  ┌──────────────────────────────────────────────┐   │
│  │              Prisma ORM                      │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              PostgreSQL Database                     │
│         users │ financial_records                   │
└─────────────────────────────────────────────────────┘
```

### Clean Architecture Principles

- **Controllers**: HTTP only — parse request, call service, return response. Zero business logic.
- **Services**: All business logic, role enforcement, error handling.
- **Repositories**: All database access via Prisma. No SQL in services.
- **Guards**: Applied globally via `APP_GUARD` — never checked manually in controllers.
- **DTOs**: All inputs validated via `class-validator` decorators.

---

## Tech Stack

| Layer      | Technology        | Reasoning |
|------------|-------------------|-----------|
| Backend    | NestJS            | Structured DI, modules, decorators, built-in Swagger |
| ORM        | Prisma            | Type-safe queries, schema-first, migrations |
| Database   | PostgreSQL        | ACID compliance, raw SQL aggregations for analytics |
| Auth       | JWT + Passport    | Stateless, scalable, industry standard |
| Validation | class-validator   | Decorator-based, integrates with NestJS pipes |
| Rate limit | @nestjs/throttler | Built-in, minimal config |
| Frontend   | React + Vite      | Fast DX, tree-shaking, plugin ecosystem |
| Styling    | Tailwind CSS      | Utility-first, no runtime cost |
| HTTP       | Axios             | Interceptors for auth + error handling |
| Charts     | Recharts          | React-native, composable |

---

## Project Structure

```
finance-dashboard/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema with enums & indexes
│   │   └── seed.ts             # 150 records + 3 demo users
│   └── src/
│       ├── main.ts             # Bootstrap, Swagger, CORS, validation pipe
│       ├── app.module.ts       # Root module with throttler
│       ├── config/             # Configuration module
│       ├── database/
│       │   ├── database.module.ts
│       │   └── prisma.service.ts
│       ├── common/
│       │   ├── decorators/
│       │   │   ├── roles.decorator.ts      # @Roles(...) metadata setter
│       │   │   ├── current-user.decorator.ts
│       │   │   └── public.decorator.ts     # @Public() bypass guard
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts       # Global JWT enforcement
│       │   │   └── roles.guard.ts          # Global RBAC enforcement
│       │   ├── filters/
│       │   │   └── global-exception.filter.ts
│       │   ├── dto/
│       │   │   └── pagination.dto.ts
│       │   ├── enums/index.ts
│       │   └── utils/api-response.ts
│       └── modules/
│           ├── auth/
│           │   ├── dto/auth.dto.ts
│           │   ├── strategies/jwt.strategy.ts
│           │   ├── auth.repository.ts
│           │   ├── auth.service.ts         # register, login, validate
│           │   ├── auth.controller.ts
│           │   └── auth.service.spec.ts    # Unit tests
│           ├── users/
│           │   ├── dto/users.dto.ts
│           │   ├── users.repository.ts
│           │   ├── users.service.ts
│           │   └── users.controller.ts
│           ├── records/
│           │   ├── dto/records.dto.ts
│           │   ├── records.repository.ts
│           │   ├── records.service.ts
│           │   ├── records.controller.ts
│           │   └── records.service.spec.ts # Unit tests
│           └── analytics/
│               ├── analytics.repository.ts # Raw SQL aggregations
│               ├── analytics.service.ts
│               └── analytics.controller.ts
└── frontend/
    └── src/
        ├── contexts/AuthContext.tsx   # JWT auth state + helpers
        ├── components/
        │   ├── AppLayout.tsx
        │   ├── Sidebar.tsx
        │   ├── ProtectedRoute.tsx
        │   └── ui.tsx                 # Reusable UI primitives
        ├── pages/
        │   ├── AuthPage.tsx           # Login + Register
        │   ├── DashboardPage.tsx      # Summary + recent transactions
        │   ├── RecordsPage.tsx        # CRUD table with filters
        │   ├── AnalyticsPage.tsx      # Charts (area, bar, pie)
        │   └── AdminPage.tsx          # User management
        ├── services/api.service.ts    # All API call functions
        ├── lib/api.ts                 # Axios instance + interceptors
        ├── types/index.ts             # Shared TypeScript types
        └── utils/helpers.ts           # Formatting, colors, constants
```

---

## API Endpoints

### Authentication
| Method | Path              | Access | Description |
|--------|-------------------|--------|-------------|
| POST   | `/api/v1/auth/register` | Public | Register new user |
| POST   | `/api/v1/auth/login`    | Public | Login → JWT token |
| GET    | `/api/v1/auth/me`       | All    | Get own profile |

### Financial Records
| Method | Path                 | Access          | Description |
|--------|----------------------|-----------------|-------------|
| GET    | `/api/v1/records`    | ANALYST, ADMIN  | List records (filters + pagination) |
| GET    | `/api/v1/records/:id` | ANALYST, ADMIN | Get single record |
| POST   | `/api/v1/records`    | ANALYST, ADMIN  | Create record |
| PATCH  | `/api/v1/records/:id` | ANALYST, ADMIN | Update record |
| DELETE | `/api/v1/records/:id` | ANALYST, ADMIN | Soft delete |

### Analytics
| Method | Path                      | Access          | Description |
|--------|---------------------------|-----------------|-------------|
| GET    | `/api/v1/analytics/summary`    | ALL        | Total income/expenses/net |
| GET    | `/api/v1/analytics/categories` | ANALYST, ADMIN | Category breakdown |
| GET    | `/api/v1/analytics/trends`     | ANALYST, ADMIN | Monthly trends |
| GET    | `/api/v1/analytics/recent`     | ANALYST, ADMIN | Last 10 transactions |

### Users (Admin Only)
| Method | Path                        | Access | Description |
|--------|-----------------------------|--------|-------------|
| GET    | `/api/v1/users`             | ADMIN  | List users |
| GET    | `/api/v1/users/stats`       | ADMIN  | User count by role |
| GET    | `/api/v1/users/:id`         | ADMIN  | Get user |
| POST   | `/api/v1/users`             | ADMIN  | Create user with role |
| PATCH  | `/api/v1/users/:id`         | ADMIN  | Update user/role |
| PATCH  | `/api/v1/users/:id/activate` | ADMIN | Activate account |
| PATCH  | `/api/v1/users/:id/deactivate` | ADMIN | Deactivate account |

---

## Role-Based Access Control

```
┌──────────────────────────────────────────────────────────┐
│ VIEWER   │ Analytics Summary only                        │
│──────────────────────────────────────────────────────────│
│ ANALYST  │ VIEWER + Records CRUD + Full Analytics        │
│──────────────────────────────────────────────────────────│
│ ADMIN    │ ANALYST + User Management + All Records       │
└──────────────────────────────────────────────────────────┘
```

**Implementation**: Guards are registered as `APP_GUARD` providers — they apply globally without any controller knowing about them. The `@Roles()` decorator sets metadata; `RolesGuard` reads it.

**Ownership**: Analysts can only mutate their own records; Admins can mutate any record.

---

## Database Schema

```sql
-- ENUM types
CREATE TYPE "Role"       AS ENUM ('VIEWER', 'ANALYST', 'ADMIN');
CREATE TYPE "RecordType" AS ENUM ('INCOME', 'EXPENSE');

-- Users table
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,             -- bcrypt hashed
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  role        "Role"    NOT NULL DEFAULT 'VIEWER',
  is_active   BOOLEAN   NOT NULL DEFAULT true,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL
);

-- Financial records table
CREATE TABLE financial_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  amount      DECIMAL(15,2) NOT NULL,
  type        "RecordType" NOT NULL,
  category    TEXT NOT NULL,
  date        DATE NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL,
  deleted_at  TIMESTAMP,                 -- soft delete

  -- Indexes for query performance
  INDEX idx_user_id   (user_id),
  INDEX idx_date      (date),
  INDEX idx_category  (category),
  INDEX idx_deleted   (deleted_at)
);
```

---

## Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or pnpm

### 1. Clone & Configure

```bash
git clone <repo-url>
cd finance-dashboard
```

### 2. Backend Setup

```bash
cd backend

# Copy and configure env
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET in .env

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npx ts-node prisma/seed.ts

# Start development server
npm run start:dev
```

Backend runs at: `http://localhost:3001`  
Swagger docs at: `http://localhost:3001/api/docs`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Docker (Alternative)

```bash
# From root directory
docker-compose up -d

# Seed the database
docker exec finboard_backend npx ts-node prisma/seed.ts
```

---

## Demo Credentials

| Role    | Email                    | Password      |
|---------|--------------------------|---------------|
| Admin   | admin@finboard.com       | Password123!  |
| Analyst | analyst@finboard.com     | Password123!  |
| Viewer  | viewer@finboard.com      | Password123!  |

---

## Running Tests

```bash
cd backend
npm test           # Run all unit tests
npm run test:cov   # With coverage report
```

---

## Assumptions

1. **Self-registration creates VIEWER accounts** — Admins promote users via the Admin panel.
2. **Soft delete is permanent from the UI** — records with `deleted_at` are excluded from all queries but remain in the DB for audit purposes.
3. **Analytics are scoped** — Non-admins see analytics for their own records only.
4. **Amount is always positive** — `type` (INCOME/EXPENSE) determines direction; negative amounts are rejected by validation.
5. **No multi-tenancy** — Single organization instance. Each user has their own records.

---

## Future Improvements

### Scalability
- **Redis caching** for analytics endpoints (high read, low write).
- **Horizontal scaling** with stateless JWT — no session store needed.
- **Read replicas** for analytics queries to offload primary DB.
- **Pagination cursor-based** instead of offset for large datasets.

### Features
- **Export to CSV/PDF** for records and analytics.
- **Budget goals** — set monthly targets per category.
- **Recurring transactions** — auto-generate records on a schedule.
- **Multi-currency support** with exchange rate API integration.
- **Audit log** — track all create/update/delete events.
- **Email notifications** — weekly/monthly summary emails.

### Architecture
- **Microservices** — split analytics into a dedicated service if query load grows.
- **Event-driven** — use message queues (BullMQ/Kafka) for background jobs.
- **GraphQL** — flexible querying for complex dashboard needs.
- **OpenTelemetry** — distributed tracing across services.

---

## Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWT with expiry
- [x] Rate limiting on all endpoints
- [x] Input validation on all inputs (class-validator)
- [x] SQL injection prevented via Prisma parameterized queries
- [x] CORS restricted to frontend origin
- [x] Role checks enforced at guard level (not controller)
- [x] Inactive users blocked at token validation
- [x] UUID primary keys (no sequential ID enumeration)
- [x] Soft delete (data retention without exposure)

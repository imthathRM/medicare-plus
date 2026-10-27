# MediCare Plus — Backend (Stage 6: PostgreSQL Database Integration)

Modular Node.js + Express backend integrated with PostgreSQL using Prisma ORM for the MediCare Plus Hospital Management System.

---

## Stage 6 Scope & Implementation Highlights

- **Framework**: Express.js with native ES modules (`"type": "module"`).
- **Database Engine**: PostgreSQL (tested with PostgreSQL 17 on Windows x64).
- **ORM**: Prisma ORM (`@prisma/client` and `prisma` CLI).
- **Database Name**: `MediCare_Plus`.
- **Relational Data Models**:
  - `Department`: Clinical and non-clinical departments.
  - `Doctor`: Doctor profiles and consultation fees, linked to departments.
  - `Patient`: Comprehensive patient clinical history, contact information, and status.
  - `Appointment`: Clinical bookings linking patients and attending doctors.
  - `Admission`: Inpatient ward tracking and bed assignments.
  - `Invoice`: Financial billing records with transactional payment support.
  - `Medicine`: Pharmaceutical inventory with transactional stock level updates.
  - `Staff`: Hospital administrative, nursing, and clinical staff.
  - `UserSetting`: Isolated per-user appearance preferences (`light` | `dark`).
  - `HospitalProfile`: Hospital institutional metadata and bed capacity.
- **Transactional Consistency**: Financial payment settlements and pharmaceutical stock adjustments use atomic `prisma.$transaction(...)` blocks.
- **Per-User Theme Isolation**: Each user's theme selection is stored in the `user_settings` PostgreSQL table, ensuring independent user preferences.
- **Health Check & Database Probe**: `GET /api/health` queries PostgreSQL (`SELECT 1`) to report live database connectivity alongside uptime.
- **Migration & Idempotent Seeding**: Initial database migration applied cleanly with automated, repeatable seeding (upserts avoid duplicate records).

---

## Prerequisites

1. **Node.js**: `v20+` (tested on Node `v24.15.0`)
2. **npm**: `v10+` (tested on npm `11.12.1`)
3. **PostgreSQL**: PostgreSQL 14+ (tested on PostgreSQL 17 running on localhost:5432)

---

## Environment Configuration

Create or update `backend/.env` with your PostgreSQL database credentials:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# PostgreSQL Database Connection URL (Prisma ORM)
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/MediCare_Plus?schema=public"
```

> **Security Note**: Never commit `backend/.env` to Git. The file is excluded by `.gitignore`. Use `backend/.env.example` as a safe placeholder template.

---

## Database Setup & Prisma Migrations

### 1. Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### 2. Apply Database Migrations
```bash
cd backend
npx prisma migrate dev --name init_postgres_schema
```
*(If the `medicare` database does not exist, Prisma will prompt to create it automatically.)*

### 3. Seed Sample Data (Optional / Repeatable)
The seed script uses `upsert` queries to prevent duplicate entries:
```bash
cd backend
npm run prisma:seed
# or
npx prisma db seed
```

---

## Running the Backend

From the workspace root:
```bash
# Start backend in production mode
npm run server

# Start backend in development mode with automatic reload
npm run server:dev
```

Or from inside `backend/`:
```bash
cd backend
npm start
npm run dev
```

---

## Verification & Testing

### Run Backend Test Suite
```bash
# From workspace root
npm run test:backend

# Or from inside backend/
cd backend
npm test
```
The test suite verifies:
1. `GET /api/health` returns HTTP 200 with `{ database: { status: 'connected', provider: 'postgresql' } }`.
2. Per-user theme isolation in PostgreSQL (`doctor-sarah` = `dark`, `nurse-priya` = `light`).
3. Theme input validation (rejecting non-`light`/`dark` values with HTTP 400).
4. Full CRUD operations against PostgreSQL for Patients.
5. Directory reads for Doctors, Departments, Appointments, Admissions, Invoices, Medicines, and Staff.
6. Transactional payment recording against invoices (`POST /api/billing/:id/payment`).
7. Transactional stock adjustments for medicines (`PUT /api/pharmacy/:id/stock`).
8. Executive KPI metrics calculation directly from PostgreSQL collections.
9. Centralized 404 and 500 error interception.

---

## Common Connection & Migration Errors

| Error | Cause | Solution |
| :--- | :--- | :--- |
| `fe_sendauth: no password supplied` | PostgreSQL requires password authentication but password was omitted. | Ensure `DATABASE_URL` in `backend/.env` includes the correct password: `postgresql://user:password@localhost:5432/MediCare_Plus?schema=public`. |
| `Database MediCare_Plus does not exist` | Database has not been initialized yet in pgAdmin or PostgreSQL. | Create the database in pgAdmin or run `CREATE DATABASE "MediCare_Plus";` in `psql`, then apply migrations. |
| `Environment variable not found: DATABASE_URL` | Prisma command was executed outside `backend/` where `.env` is located. | Change directory to `backend/` before running Prisma commands, or pass `--schema=backend/prisma/schema.prisma`. |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL service is stopped or port 5432 is blocked. | Verify that the Windows service `postgresql-x64-17` is running (`Get-Service *postgres*`). |

---

## Roadmap Alignment (Remaining Stages)

- **Stage 7 — Authentication & Authorization**: Implement JWT authentication, bcrypt password hashing, login/register endpoints, and role-based access control (Admin, Doctor, Nurse, Staff). Replace `devUserResolver` with secure token verification.
- **Stage 8 — Frontend-Backend Integration**: Wire React frontend service modules (`src/services/*.js`) to live Express endpoints, replacing mock delays with async HTTP client calls.

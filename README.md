# MediCare Plus — Hospital Management System

A full-stack Hospital Management System designed to manage hospital operations, including patients, doctors, appointments, admissions, billing, pharmacy inventory, staff, and reports.

## 1. Project Overview

MediCare Plus is a modern hospital management application developed using React, Node.js, Express.js, PostgreSQL, and Prisma ORM.

The system provides a centralized platform for managing hospital operations through a user-friendly interface and a modular backend architecture.

### Key Highlights

- Patient registration and management
- Doctor and department management
- Appointment scheduling
- Inpatient admission and discharge management
- Billing and invoice management
- Pharmacy and medicine inventory management
- Staff management
- Hospital reports and analytics
- JWT-based authentication
- Hospital settings and user preferences
- PostgreSQL database integration

## 2. Technologies Used

| Component | Technology |
|---|---|
| Frontend | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Icons | Lucide React |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| Password Hashing | bcryptjs |
| API Communication | JavaScript Fetch API |

## 3. System Architecture

The application follows a client-server architecture.

1. **Frontend:** React provides the user interface and handles user interactions.
2. **API Service:** The centralized API client sends HTTP requests and attaches JWT tokens when available.
3. **Backend:** Express.js handles API requests, routing, middleware, and business logic.
4. **ORM:** Prisma manages communication between the backend and PostgreSQL.
5. **Database:** PostgreSQL stores application data.

## 4. Project Folder Structure

```text
medicare-plus/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 5. Prerequisites

Install the following software before running the project:

- Node.js (v20 or later recommended)
- npm
- PostgreSQL (v14 or later)
- Git

## 6. Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/imthathRM/medicare-plus.git
cd medicare-plus
```

### Step 2: Install Frontend Dependencies

Run from the project root:

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4: Configure Environment Variables

Copy `.env.example` to `.env` inside the `backend/` directory.

Update the values according to your local PostgreSQL configuration.

Example:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/MediCare_Plus?schema=public"
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=24h
```

Do not commit the `.env` file or expose real credentials.

### Step 5: Create the PostgreSQL Database

Create a PostgreSQL database named:

```text
MediCare_Plus
```

Make sure PostgreSQL is running before continuing.

### Step 6: Generate Prisma Client

From the `backend/` directory:

```bash
npm run prisma:generate
```

### Step 7: Apply Database Migrations

```bash
npx prisma migrate deploy
```

### Step 8: Seed Initial Data

```bash
npm run prisma:seed
```

The seed script inserts initial hospital data and demonstration user accounts. It uses Prisma `upsert` operations to avoid duplicate records.

## 7. Running the Application

Run the frontend and backend in separate terminals.

### Terminal 1 — Frontend

From the project root:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### Terminal 2 — Backend

From the project root:

```bash
npm run server:dev
```

Backend URL:

```text
http://localhost:5000
```

Backend health check:

```text
http://localhost:5000/api/health
```

## 8. API Overview

The backend provides modular API route groups:

| Module | Base API Path |
|---|---|
| Authentication | `/api/auth` |
| Health | `/api/health` |
| Settings | `/api/settings` |
| Patients | `/api/patients` |
| Doctors | `/api/doctors` |
| Departments | `/api/departments` |
| Appointments | `/api/appointments` |
| Admissions | `/api/admissions` |
| Billing | `/api/billing` |
| Invoices | `/api/invoices` |
| Pharmacy | `/api/pharmacy` |
| Inventory | `/api/inventory` |
| Staff | `/api/staff` |
| Reports | `/api/reports` |

## 9. Database Design

The Prisma schema defines 11 database models:

- User
- Department
- Doctor
- Patient
- Appointment
- Admission
- Invoice
- Medicine
- Staff
- UserSetting
- HospitalProfile

The database uses relational associations between departments, doctors, patients, appointments, admissions, and invoices.

## 10. Authentication and Security

The backend uses:

- JSON Web Tokens (JWT) for authentication.
- bcryptjs for password hashing.
- Bearer token authentication for protected API requests.
- Environment variables for sensitive configuration.
- Express middleware for request handling and error management.

Never publish real passwords, JWT secrets, or database credentials.

## 11. Build and Testing

### Frontend Production Build

From the project root:

```bash
npm run build
```

### Frontend Lint

```bash
npm run lint
```

### Backend Tests

```bash
npm run test:backend
```

Additional backend test commands can be executed inside `backend/`:

```bash
npm run test:integration
npm run test:system
npm run test:all
```

## 12. Additional Documentation

For backend-specific setup, database configuration, migrations, API testing, and troubleshooting, refer to:

```text
backend/README.md
```

## 13. Project Repository

GitHub: https://github.com/imthathRM/medicare-plus

---

**MediCare Plus — Hospital Management System**
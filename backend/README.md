# MediCare Plus — Backend (Stage 5)

Clean, modular Node.js + Express.js backend foundation for the MediCare Plus Hospital Management System.

---

## Stage 5 Scope & Implementation Highlights

- **Framework**: Express.js with native ES modules (`"type": "module"`).
- **CORS Configuration**: Configured for Vite frontend running on `http://localhost:5173` with credentials support.
- **Environment Management**: Configured via `dotenv` with `backend/.env.example`. Real `.env` files are excluded from Git via `.gitignore`.
- **Health Check**: Operational health endpoint at `GET /api/health`.
- **User Theme Preference API**: Independent per-user Light / Dark theme selection via `GET /api/settings/theme` and `PUT /api/settings/theme` with strict validation.
- **Modular Route Architecture**: Prepared modular routes for Patients, Doctors, Departments, Appointments, Admissions, Billing/Invoices, Pharmacy/Inventory, Staff, Reports, and Settings.
- **Error Handling**: Centralized 404 handler and error middleware delivering standardized JSON response envelopes.
- **Data Persistence Mode**: Temporary in-memory development store (`backend/src/data/memoryStore.js`). **No MongoDB connection is implemented yet** (strictly scheduled for Stage 6).
- **Authentication Mode**: Temporary development header scaffolding (`devUserResolver.js`). **No production JWT authentication is implemented yet** (strictly scheduled for Stage 7).

---

## Getting Started

### 1. Prerequisites
- Node.js `v20+` (Tested on Node `v24.15.0`)
- npm `v10+`

### 2. Installation
From the project root:
```bash
npm install --prefix backend
```
Or directly inside the `backend/` directory:
```bash
cd backend
npm install
```

### 3. Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp backend/.env.example backend/.env
```
Default configuration:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 4. Running the Backend
From the project root:
```bash
# Start server in production mode
npm run server

# Start server in development mode (with native file watcher)
npm run server:dev
```
Or from within `backend/`:
```bash
cd backend
npm start
# or
npm run dev
```

---

## API Endpoints Reference

All endpoints return a standardized JSON response envelope:
```json
{
  "success": true,
  "message": "Human readable description",
  "data": { ... },
  "timestamp": "2026-10-27T08:15:00.000Z"
}
```

### 1. Health & System
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime, status, environment, and timestamp |

### 2. User Theme Preference & Settings
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/settings/theme` | Retrieve theme preference for current user (`x-user-id` header or `?userId=`) |
| `PUT` | `/api/settings/theme` | Update theme preference for current user. Payload: `{"themeMode": "dark" \| "light"}` |
| `GET` | `/api/settings/hospital` | Retrieve hospital institutional details |
| `PUT` | `/api/settings/hospital` | Update hospital institutional profile |

### 3. Patients
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/patients` | Retrieve all patients (supports `?search=`) |
| `GET` | `/api/patients/:id` | Retrieve patient by ID |
| `POST` | `/api/patients` | Register new patient record |
| `PUT` | `/api/patients/:id` | Update patient record |
| `DELETE` | `/api/patients/:id` | Archive patient record |

### 4. Doctors
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/doctors` | Retrieve all doctors (supports `?department=`, `?status=`) |
| `GET` | `/api/doctors/:id` | Retrieve doctor by ID |
| `POST` | `/api/doctors` | Register new doctor |
| `PUT` | `/api/doctors/:id` | Update doctor profile |

### 5. Departments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/departments` | Retrieve all clinical departments |
| `GET` | `/api/departments/:id` | Retrieve department by ID |

### 6. Appointments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/appointments` | Retrieve appointments (supports `?status=`, `?date=`) |
| `GET` | `/api/appointments/:id` | Retrieve appointment by ID |
| `POST` | `/api/appointments` | Schedule new appointment |
| `PUT` / `PATCH` | `/api/appointments/:id/status` | Update appointment status (`Confirmed`, `Completed`, etc.) |

### 7. Admissions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admissions` | Retrieve inpatient admissions |
| `GET` | `/api/admissions/:id` | Retrieve admission by ID |
| `POST` | `/api/admissions` | Admit a patient |
| `PUT` | `/api/admissions/:id` | Update admission record (ward, bed, status) |

### 8. Billing & Invoices
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/billing` | Retrieve all invoices (alias: `/api/invoices`) |
| `GET` | `/api/billing/:id` | Retrieve invoice by ID |
| `POST` | `/api/billing` | Create new billing invoice |
| `POST` | `/api/billing/:id/payment` | Record payment against an invoice |

### 9. Pharmacy & Inventory
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/pharmacy` | Retrieve medicines list (alias: `/api/inventory`) |
| `GET` | `/api/pharmacy/:id` | Retrieve medicine details by ID |
| `POST` | `/api/pharmacy` | Add new medicine |
| `PUT` | `/api/pharmacy/:id/stock` | Adjust stock quantity |

### 10. Staff
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/staff` | Retrieve hospital staff list |
| `GET` | `/api/staff/:id` | Retrieve staff member by ID |
| `POST` | `/api/staff` | Register new staff member |

### 11. Reports
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reports/summary` | Executive summary KPI metrics |
| `GET` | `/api/reports/trends` | Monthly appointment trends dataset |
| `GET` | `/api/reports/distribution` | Department patient distribution dataset |

---

## Testing the Backend

### Testing with PowerShell or cURL

1. **Verify Health Endpoint**:
```bash
curl http://localhost:5000/api/health
```

2. **Retrieve Current User Theme (Default User)**:
```bash
curl http://localhost:5000/api/settings/theme
```

3. **Update Theme to Dark for User 'doctor-01'**:
```bash
curl -X PUT http://localhost:5000/api/settings/theme \
  -H "Content-Type: application/json" \
  -H "x-user-id: doctor-01" \
  -d '{"themeMode": "dark"}'
```

4. **Verify Independent Theme for User 'nurse-02'**:
```bash
curl -X PUT http://localhost:5000/api/settings/theme \
  -H "Content-Type: application/json" \
  -H "x-user-id: nurse-02" \
  -d '{"themeMode": "light"}'

# Verify 'doctor-01' is dark while 'nurse-02' is light
curl -H "x-user-id: doctor-01" http://localhost:5000/api/settings/theme
curl -H "x-user-id: nurse-02" http://localhost:5000/api/settings/theme
```

5. **Test Invalid Theme Mode Validation (Returns 400 Bad Request)**:
```bash
curl -X PUT http://localhost:5000/api/settings/theme \
  -H "Content-Type: application/json" \
  -d '{"themeMode": "high-contrast"}'
```

---

## Roadmap Alignment (Remaining Stages)

- **Stage 6 — Database Integration**: Connect to MongoDB via Mongoose, implement Schemas & Models, and migrate in-memory stores to persistent collections.
- **Stage 7 — Authentication & Authorization**: Implement JWT authentication, bcrypt password hashing, login/register endpoints, and role-based access control (Admin, Doctor, Nurse, Staff). Replace `devUserResolver` with secure token verification.
- **Stage 8 — Frontend-Backend Integration**: Wire React frontend service modules (`api.js`, `themeService.js`, etc.) to live Express endpoints, replacing mock delays with async HTTP client calls.

# MediCare Plus — Hospital Management System

A modern, full-featured academic and enterprise-grade Hospital Management System frontend built with React, Vite, Tailwind CSS, React Router, and Lucide Icons.

## 🩺 System Overview

**MediCare Plus** is designed with a strict medical light theme, featuring:
- Primary medical blue (`#0284c7`) and secondary teal (`#0d9488`) accents
- Clean typography (Plus Jakarta Sans) with soft borders and accessible contrast
- Sri Lankan Rupee (LKR) financial and billing formatting
- In-memory mock data engine with full interactive CRUD support
- Printable invoices and clinical operational performance reports
- Pre-configured centralized API service layer ready for Part 2 backend integration

---

## 🚀 Quick Start Instructions

### 1. Prerequisites
Ensure **Node.js** (v18+ recommended; tested on v24) and **npm** are installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to:
```
http://localhost:5173
```

---

## 🔐 Demonstration Authentication
This Part 1 frontend foundation includes a demonstration login flow:
- **Email / Staff ID**: `admin@medicare.plus`
- **Password**: `password123`
- *Or click "Autofill demo credentials" on the login screen.*

---

## 📋 Implemented Pages & Features

| Page | Route | Description & Features |
| :--- | :--- | :--- |
| **Login** | `/login` | Healthcare branding, show/hide password toggle, remember-me checkbox, validation, demo credential autofill. |
| **Dashboard** | `/` | Real-time KPIs (Total Patients, Doctors, Today's Consultations, Inpatients, Bed Occupancy), appointment trend area chart, patient distribution donut chart, upcoming schedule table, recent registrations, quick action buttons. |
| **Patients** | `/patients` | Searchable patient registry, multi-criteria filters (Status, Gender), paginated data table, dossier view modal, add patient modal with DOB/age calculation and validation, edit modal, delete confirmation. |
| **Doctors** | `/doctors` | Grid card view and table view toggle, specialty and department filtering, availability badges, consultation rates in LKR, add & edit doctor modals, doctor dossier modal. |
| **Departments** | `/departments` | Clinical unit cards, bed capacities, head of department details, phone extensions, doctor rosters per unit, add & edit department dialogs. |
| **Appointments** | `/appointments` | Consultation schedule, date and status filters, new booking modal (patient & doctor dropdowns, fee preview), view modal, complete appointment action, cancel confirmation. |
| **Admissions** | `/admissions` | Inpatient bed tracking, ward allocation (ICU, Post-op, Antenatal HDU), primary diagnosis, admission date, daily rate (LKR), admit patient modal, discharge confirmation dialog. |
| **Billing** | `/billing` | Itemized invoice registry in Sri Lankan Rupees (LKR), payment status (Paid, Partially Paid, Pending, Overdue), printable tax invoice modal with line items (`window.print()`), mock payment settlement recorder. |
| **Pharmacy & Inventory** | `/pharmacy` | Medication inventory table, therapeutic category and low-stock filters, low-stock warning badges (`qty <= minThreshold`), quick stock adjustment dialog (add/deduct units), add & edit medicine modals. |
| **Staff** | `/staff` | Nursing officers, lab technologists, radiographers, administrators, shift schedules, department assignment, search and filter, staff registration and editing. |
| **Reports** | `/reports` | Executive clinical analytics, financial breakdown chart (Inpatient vs Outpatient in LKR), appointment volume trends, period filter selector, print-ready layout (`@media print`). |
| **Settings** | `/settings` | Hospital institutional profile (hotlines, TIN, accreditation), administrator user profile, system preferences (LKR currency, appointment slot duration, automated SMS & email toggles). |

---

## 📁 Project Architecture

```
medicare-plus/
├── src/
│   ├── assets/              # Icons and logos
│   ├── components/
│   │   ├── charts/          # Interactive charts (AppointmentTrend, DepartmentDistribution, RevenueTrend)
│   │   └── common/          # Reusable UI (Badge, Button, Card, ConfirmDialog, DataTable, FormField, Modal, SearchInput, StatCard)
│   ├── context/
│   │   ├── AuthContext.jsx          # Demo authentication state & credentials
│   │   ├── HospitalDataContext.jsx  # In-memory reactive state & CRUD functions
│   │   └── ToastContext.jsx         # Live notification banner system
│   ├── data/                # Sri Lankan healthcare mock datasets
│   ├── layouts/
│   │   ├── MainLayout.jsx   # Collapsible sidebar, topbar, notification center
│   │   ├── Sidebar.jsx      # Navigation drawer with live badges
│   │   ├── Topbar.jsx       # Search, breadcrumbs, notifications, user dropdown
│   │   └── AuthLayout.jsx   # Authentication wrapper
│   ├── pages/               # 12 functional application pages
│   ├── routes/              # Protected routing with React Router
│   ├── services/            # Centralized API service abstractions (mock adapters)
│   └── utils/               # Formatters (LKR, Date, Time) & form validators
```

---

## 🛠️ Build and Lint Verification

```bash
# Production bundle build
npm run build

# Code lint check
npm run lint
```

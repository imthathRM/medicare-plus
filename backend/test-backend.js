import { createApp } from './src/app.js';
import prisma from './src/config/prisma.js';
import jwt from 'jsonwebtoken';
import { config } from './src/config/environment.js';

async function runTests() {
  console.log('================================================================');
  console.log('   MediCare Plus — Stage 7 Security & Auth Verification Suite   ');
  console.log('================================================================\n');

  const app = createApp();
  const PORT = 5057; // Dedicated test port
  const server = app.listen(PORT);
  const baseURL = `http://localhost:${PORT}/api`;

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extra = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${extra}`);
      failed++;
    }
  }

  let adminToken = '';
  let doctorToken = '';
  let receptionistToken = '';
  let pharmacistToken = '';

  try {
    // -------------------------------------------------------------------------
    // 1. Health check & PostgreSQL Connection Probe
    // -------------------------------------------------------------------------
    console.log('[1] Health Endpoint & Database Probe Verification');
    const healthRes = await fetch(`${baseURL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthData.success === true, 'GET /api/health response envelope success is true');
    assert(healthData.data.status === 'healthy', 'GET /api/health reports healthy');
    assert(healthData.data.database?.status === 'connected', 'Database probe reports connected to PostgreSQL');

    // -------------------------------------------------------------------------
    // 2. Authentication: Login & Credential Verification
    // -------------------------------------------------------------------------
    console.log('\n[2] User Authentication & JWT Issuance');

    // 2a. Admin Login
    const adminLoginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mohamedimthath25@gmail.com', password: '@Rmi2004' }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Valid admin login returns 200 OK');
    assert(!!adminLoginData.data?.token, 'Login returns JWT token string');
    assert(adminLoginData.data?.user?.role === 'ADMIN', 'Admin user has role ADMIN');
    assert(adminLoginData.data?.user?.name === 'ImthathRM', 'Admin user name is ImthathRM');
    assert(!adminLoginData.data?.user?.password, 'User password is not leaked in login response');
    adminToken = adminLoginData.data?.token;

    // 2b. Doctor Login
    const docLoginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@medicare.plus', password: 'password123' }),
    });
    const docLoginData = await docLoginRes.json();
    assert(docLoginRes.status === 200 && docLoginData.data?.user?.role === 'DOCTOR', 'Doctor login succeeds with DOCTOR role');
    doctorToken = docLoginData.data?.token;

    // 2c. Receptionist Login
    const recpLoginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medicare.plus', password: 'password123' }),
    });
    const recpLoginData = await recpLoginRes.json();
    assert(recpLoginRes.status === 200 && recpLoginData.data?.user?.role === 'RECEPTIONIST', 'Receptionist login succeeds with RECEPTIONIST role');
    receptionistToken = recpLoginData.data?.token;

    // 2d. Pharmacist Login
    const pharmLoginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pharmacist@medicare.plus', password: 'password123' }),
    });
    const pharmLoginData = await pharmLoginRes.json();
    assert(pharmLoginRes.status === 200 && pharmLoginData.data?.user?.role === 'PHARMACIST', 'Pharmacist login succeeds with PHARMACIST role');
    pharmacistToken = pharmLoginData.data?.token;

    // 2e. Invalid Password
    const badPwdRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mohamedimthath25@gmail.com', password: 'wrongpassword' }),
    });
    const badPwdData = await badPwdRes.json();
    assert(badPwdRes.status === 401, 'Invalid password rejected with 401 Unauthorized');
    assert(badPwdData.success === false, 'Invalid login response success is false');

    // 2f. Non-existent User
    const noUserRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fakeuser@medicare.plus', password: 'password123' }),
    });
    assert(noUserRes.status === 401, 'Non-existent user rejected with 401 Unauthorized');

    // 2g. Missing Fields
    const emptyRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '' }),
    });
    assert(emptyRes.status === 400, 'Blank login payload rejected with 400 Bad Request');

    // -------------------------------------------------------------------------
    // 3. Password Storage Verification in PostgreSQL
    // -------------------------------------------------------------------------
    console.log('\n[3] Database Password Hash Verification');
    const dbUsers = await prisma.user.findMany();
    assert(dbUsers.length >= 4, `At least 4 user accounts exist in PostgreSQL (found: ${dbUsers.length})`);
    for (const u of dbUsers) {
      assert(
        u.password.startsWith('$2a$') || u.password.startsWith('$2b$'),
        `User '${u.email}' password is encrypted with bcrypt hash format`
      );
      assert(
        !u.password.includes('password123'),
        `User '${u.email}' password does NOT contain plaintext password`
      );
    }

    // -------------------------------------------------------------------------
    // 4. Session Verification & Token Validation (/api/auth/me)
    // -------------------------------------------------------------------------
    console.log('\n[4] Token Validation & Session Verification (/api/auth/me)');

    // 4a. Valid Me call
    const meRes = await fetch(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me with valid token returns 200 OK');
    assert(meData.data.user?.email === 'mohamedimthath25@gmail.com', 'GET /api/auth/me returns verified user profile');
    assert(meData.data.user?.name === 'ImthathRM', 'GET /api/auth/me returns updated admin name ImthathRM');

    // 4b. No token
    const noTokenMe = await fetch(`${baseURL}/auth/me`);
    assert(noTokenMe.status === 401, 'GET /api/auth/me without token returns 401 Unauthorized');

    // 4c. Invalid / Tampered token
    const badTokenMe = await fetch(`${baseURL}/auth/me`, {
      headers: { Authorization: 'Bearer this-is-a-forged-fake-jwt-token' },
    });
    assert(badTokenMe.status === 401, 'GET /api/auth/me with forged token returns 401 Unauthorized');

    // 4d. Expired token
    const expiredToken = jwt.sign(
      { id: 'USR-ADMIN-01', email: 'mohamedimthath25@gmail.com', role: 'ADMIN' },
      config.jwtSecret,
      { expiresIn: '-1s' }
    );
    const expiredRes = await fetch(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    const expiredData = await expiredRes.json();
    assert(expiredRes.status === 401 && expiredData.error === 'TOKEN_EXPIRED', 'Expired token returns 401 with TOKEN_EXPIRED');

    // 4e. Logout endpoint
    const logoutRes = await fetch(`${baseURL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200 OK');

    // -------------------------------------------------------------------------
    // 5. Authorization & Role-Based Access Control (RBAC)
    // -------------------------------------------------------------------------
    console.log('\n[5] Authorization & Role-Based Access Control (RBAC)');

    // 5a. Unauthenticated access to protected routes
    const unauthPat = await fetch(`${baseURL}/patients`);
    assert(unauthPat.status === 401, 'Unauthenticated GET /api/patients is rejected with 401');

    const unauthBill = await fetch(`${baseURL}/billing`);
    assert(unauthBill.status === 401, 'Unauthenticated GET /api/billing is rejected with 401');

    const unauthRep = await fetch(`${baseURL}/reports/summary`);
    assert(unauthRep.status === 401, 'Unauthenticated GET /api/reports/summary is rejected with 401');

    // 5b. Admin access to Admin-only user directory
    const adminUsersRes = await fetch(`${baseURL}/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUsersRes.status === 200, 'Admin can access GET /api/auth/users (200 OK)');

    // 5c. Receptionist attempting to access Admin-only user directory (Should be 403)
    const recpUsersRes = await fetch(`${baseURL}/auth/users`, {
      headers: { Authorization: `Bearer ${receptionistToken}` },
    });
    assert(recpUsersRes.status === 403, 'Receptionist attempting GET /api/auth/users is blocked with 403 Forbidden');

    // 5d. Pharmacist attempting to access clinical reports (Should be 403)
    const pharmReportsRes = await fetch(`${baseURL}/reports/summary`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    assert(pharmReportsRes.status === 403, 'Pharmacist attempting GET /api/reports/summary is blocked with 403 Forbidden');

    // 5e. Receptionist attempting to register doctor (Admin only -> 403)
    const recpDoctorCreate = await fetch(`${baseURL}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${receptionistToken}`,
      },
      body: JSON.stringify({ name: 'Dr. Unauthorized', department: 'Cardiology' }),
    });
    assert(recpDoctorCreate.status === 403, 'Receptionist attempting POST /api/doctors is blocked with 403 Forbidden');

    // 5f. Pharmacist updating medicine stock (Permitted -> 200)
    const medicines = await prisma.medicine.findMany();
    if (medicines.length > 0) {
      const medId = medicines[0].id;
      const pharmStockRes = await fetch(`${baseURL}/pharmacy/${medId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pharmacistToken}`,
        },
        body: JSON.stringify({ adjustment: 10 }),
      });
      assert(pharmStockRes.status === 200, 'Pharmacist updating stock level via PUT /api/pharmacy/:id/stock succeeds (200 OK)');
    }

    // -------------------------------------------------------------------------
    // 6. User Theme Isolation with Verified JWT Tokens
    // -------------------------------------------------------------------------
    console.log('\n[6] Per-User Theme Preference with Verified JWT Identity');

    // Update Doctor theme to dark
    const docThemePut = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({ themeMode: 'dark' }),
    });
    const docThemePutData = await docThemePut.json();
    assert(docThemePut.status === 200 && docThemePutData.data.themeMode === 'dark', 'Doctor updates theme to dark');

    // Update Receptionist theme to light
    const recpThemePut = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${receptionistToken}`,
      },
      body: JSON.stringify({ themeMode: 'light' }),
    });
    const recpThemePutData = await recpThemePut.json();
    assert(recpThemePut.status === 200 && recpThemePutData.data.themeMode === 'light', 'Receptionist updates theme to light');

    // Verify isolation
    const docThemeGet = await fetch(`${baseURL}/settings/theme`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    const docThemeGetData = await docThemeGet.json();
    assert(docThemeGetData.data.themeMode === 'dark', 'Doctor theme remains isolated as dark');

    const recpThemeGet = await fetch(`${baseURL}/settings/theme`, {
      headers: { Authorization: `Bearer ${receptionistToken}` },
    });
    const recpThemeGetData = await recpThemeGet.json();
    assert(recpThemeGetData.data.themeMode === 'light', 'Receptionist theme remains isolated as light');

    // -------------------------------------------------------------------------
    // 7. Existing PostgreSQL CRUD Operations with Auth Tokens
    // -------------------------------------------------------------------------
    console.log('\n[7] Existing PostgreSQL CRUD Operations with Authorization');

    // Patients
    const patListRes = await fetch(`${baseURL}/patients`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(patListRes.status === 200, 'Authenticated GET /api/patients returns 200 OK');

    // Doctors
    const docListRes = await fetch(`${baseURL}/doctors`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(docListRes.status === 200, 'Authenticated GET /api/doctors returns 200 OK');

    // Departments
    const deptListRes = await fetch(`${baseURL}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deptListRes.status === 200, 'Authenticated GET /api/departments returns 200 OK');

    // Appointments
    const aptListRes = await fetch(`${baseURL}/appointments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(aptListRes.status === 200, 'Authenticated GET /api/appointments returns 200 OK');

    // Admissions
    const admListRes = await fetch(`${baseURL}/admissions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(admListRes.status === 200, 'Authenticated GET /api/admissions returns 200 OK');

    // Billing
    const billListRes = await fetch(`${baseURL}/billing`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(billListRes.status === 200, 'Authenticated GET /api/billing returns 200 OK');

    // Pharmacy
    const pharmListRes = await fetch(`${baseURL}/pharmacy`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    assert(pharmListRes.status === 200, 'Authenticated GET /api/pharmacy returns 200 OK');

    // Staff
    const staffListRes = await fetch(`${baseURL}/staff`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(staffListRes.status === 200, 'Authenticated GET /api/staff returns 200 OK');

    // Reports KPI Summary
    const repSummaryRes = await fetch(`${baseURL}/reports/summary`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert(repSummaryRes.status === 200, 'Authenticated GET /api/reports/summary returns 200 OK');

    // -------------------------------------------------------------------------
    // 8. Rate Limiting Headers Verification
    // -------------------------------------------------------------------------
    console.log('\n[8] Security Headers & Rate Limiting Verification');
    const rateLimitRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mohamedimthath25@gmail.com', password: '@Rmi2004' }),
    });
    assert(rateLimitRes.headers.has('ratelimit-limit') || rateLimitRes.headers.has('x-ratelimit-limit'), 'Login response includes standard RateLimit headers');
    assert(rateLimitRes.headers.has('x-dns-prefetch-control') || rateLimitRes.headers.has('x-content-type-options'), 'Response includes Helmet security headers');

  } catch (err) {
    console.error('Test execution failed with error:', err);
    failed++;
  } finally {
    server.close();
    await prisma.$disconnect();
    console.log('\n================================================================');
    console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();

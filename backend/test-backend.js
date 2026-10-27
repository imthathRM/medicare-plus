import { createApp } from './src/app.js';
import prisma from './src/config/prisma.js';

async function runTests() {
  console.log('--- Starting Stage 6 PostgreSQL Backend Verification ---');
  const app = createApp();
  const PORT = 5056; // Dedicated test port

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

  try {
    // 1. Health check & PostgreSQL Connection Probe
    console.log('\n[1] Health Endpoint & Database Probe Verification');
    const healthRes = await fetch(`${baseURL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthData.success === true, 'GET /api/health response envelope success is true');
    assert(healthData.data.status === 'healthy', 'GET /api/health reports healthy');
    assert(healthData.data.database?.status === 'connected', 'Database probe reports connected to PostgreSQL');
    assert(healthData.data.database?.provider === 'postgresql', 'Database provider is postgresql');

    // 2. User Theme Preference Endpoints in PostgreSQL
    console.log('\n[2] User Theme Preference Verification in PostgreSQL');
    // 2a. Default user theme
    const themeRes1 = await fetch(`${baseURL}/settings/theme`, {
      headers: { 'x-user-id': 'test-user-01' },
    });
    const themeData1 = await themeRes1.json();
    assert(themeRes1.status === 200, 'GET /api/settings/theme returns 200 OK');
    assert(themeData1.data.themeMode === 'light', 'New user defaults to light theme');

    // 2b. Update User A to dark
    const putResA = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'doctor-sarah' },
      body: JSON.stringify({ themeMode: 'dark' }),
    });
    const putDataA = await putResA.json();
    assert(putResA.status === 200 && putDataA.data.themeMode === 'dark', 'PUT /api/settings/theme sets doctor-sarah to dark');

    // 2c. Update User B to light
    const putResB = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'nurse-priya' },
      body: JSON.stringify({ themeMode: 'light' }),
    });
    const putDataB = await putResB.json();
    assert(putResB.status === 200 && putDataB.data.themeMode === 'light', 'PUT /api/settings/theme sets nurse-priya to light');

    // 2d. Multi-User Isolation in PostgreSQL
    const getResA = await fetch(`${baseURL}/settings/theme`, {
      headers: { 'x-user-id': 'doctor-sarah' },
    });
    const getDataA = await getResA.json();
    assert(getDataA.data.themeMode === 'dark', 'PostgreSQL isolation check: doctor-sarah remains dark');

    const getResB = await fetch(`${baseURL}/settings/theme`, {
      headers: { 'x-user-id': 'nurse-priya' },
    });
    const getDataB = await getResB.json();
    assert(getDataB.data.themeMode === 'light', 'PostgreSQL isolation check: nurse-priya remains light');

    // 2e. Validation: Reject invalid theme value
    const invalidPutRes = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'doctor-sarah' },
      body: JSON.stringify({ themeMode: 'neon-cyberpunk' }),
    });
    const invalidPutData = await invalidPutRes.json();
    assert(invalidPutRes.status === 400, 'PUT /api/settings/theme rejects invalid theme with 400 Bad Request');
    assert(invalidPutData.success === false, 'Invalid theme response success is false');

    // 3. PostgreSQL CRUD Operations Verification
    console.log('\n[3] PostgreSQL CRUD Operations Verification');

    // 3a. Patients CRUD
    const patientsRes = await fetch(`${baseURL}/patients`);
    const patientsData = await patientsRes.json();
    assert(patientsRes.status === 200 && Array.isArray(patientsData.data), 'GET /api/patients retrieves records from PostgreSQL');

    const testPatId = `PAT-TEST-${Date.now()}`;
    const createPatRes = await fetch(`${baseURL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testPatId,
        name: 'Database Integration Test Patient',
        gender: 'Female',
        age: 34,
        bloodGroup: 'O+',
        phone: '+94 77 000 1122',
      }),
    });
    const createPatData = await createPatRes.json();
    assert(createPatRes.status === 201 && createPatData.data.id === testPatId, 'POST /api/patients creates record in PostgreSQL');

    const getPatRes = await fetch(`${baseURL}/patients/${testPatId}`);
    const getPatData = await getPatRes.json();
    assert(getPatRes.status === 200 && getPatData.data.name === 'Database Integration Test Patient', 'GET /api/patients/:id reads from PostgreSQL');

    const updatePatRes = await fetch(`${baseURL}/patients/${testPatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age: 35 }),
    });
    const updatePatData = await updatePatRes.json();
    assert(updatePatRes.status === 200 && updatePatData.data.age === 35, 'PUT /api/patients/:id updates record in PostgreSQL');

    const delPatRes = await fetch(`${baseURL}/patients/${testPatId}`, { method: 'DELETE' });
    assert(delPatRes.status === 200, 'DELETE /api/patients/:id deletes record from PostgreSQL');

    // 3b. Doctors & Departments
    const doctorsRes = await fetch(`${baseURL}/doctors`);
    const doctorsData = await doctorsRes.json();
    assert(doctorsRes.status === 200 && doctorsData.data.length > 0, 'GET /api/doctors returns doctors from PostgreSQL');

    const deptRes = await fetch(`${baseURL}/departments`);
    const deptData = await deptRes.json();
    assert(deptRes.status === 200 && deptData.data.length >= 5, 'GET /api/departments returns departments from PostgreSQL');

    // 3c. Appointments
    const aptRes = await fetch(`${baseURL}/appointments`);
    const aptData = await aptRes.json();
    assert(aptRes.status === 200 && aptData.data.length > 0, 'GET /api/appointments returns appointments from PostgreSQL');

    // 3d. Admissions
    const admRes = await fetch(`${baseURL}/admissions`);
    const admData = await admRes.json();
    assert(admRes.status === 200 && admData.data.length > 0, 'GET /api/admissions returns admissions from PostgreSQL');

    // 3e. Invoices & Transactional Payment
    const billRes = await fetch(`${baseURL}/billing`);
    const billData = await billRes.json();
    assert(billRes.status === 200 && billData.data.length > 0, 'GET /api/billing returns invoices from PostgreSQL');

    const targetInvoice = billData.data.find((inv) => inv.status === 'Pending') || billData.data[0];
    const payRes = await fetch(`${baseURL}/billing/${targetInvoice.id}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod: 'Credit Card', amountPaid: targetInvoice.totalLKR }),
    });
    const payData = await payRes.json();
    assert(payRes.status === 200 && payData.data.status === 'Paid', 'POST /api/billing/:id/payment executes transactional update in PostgreSQL');

    // 3f. Pharmacy & Transactional Stock Adjustment
    const pharmRes = await fetch(`${baseURL}/pharmacy`);
    const pharmData = await pharmRes.json();
    assert(pharmRes.status === 200 && pharmData.data.length > 0, 'GET /api/pharmacy returns medicines from PostgreSQL');

    const targetMed = pharmData.data[0];
    const stockRes = await fetch(`${baseURL}/pharmacy/${targetMed.id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment: 10 }),
    });
    const stockData = await stockRes.json();
    assert(stockRes.status === 200 && stockData.data.stockQuantity === targetMed.stockQuantity + 10, 'PUT /api/pharmacy/:id/stock updates stock via transaction in PostgreSQL');

    // 3g. Staff
    const staffRes = await fetch(`${baseURL}/staff`);
    const staffData = await staffRes.json();
    assert(staffRes.status === 200 && staffData.data.length > 0, 'GET /api/staff returns staff from PostgreSQL');

    // 3h. Reports Summary
    const repRes = await fetch(`${baseURL}/reports/summary`);
    const repData = await repRes.json();
    assert(repRes.status === 200 && repData.data.totalPatients > 0, 'GET /api/reports/summary returns aggregated counts from PostgreSQL');

    // 4. Centralized 404 Handling
    console.log('\n[4] Centralized 404 Handling');
    const unknownRes = await fetch(`${baseURL}/non-existent-endpoint`);
    const unknownData = await unknownRes.json();
    assert(unknownRes.status === 404 && unknownData.success === false, 'Unknown endpoint returns 404 Not Found');

    console.log(`\n=============================================`);
    console.log(`Stage 6 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================`);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    failed++;
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTests();

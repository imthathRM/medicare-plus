import { createApp } from './src/app.js';

async function runTests() {
  console.log('--- Starting Stage 5 Backend Verification ---');
  const app = createApp();
  const PORT = 5055; // Dedicated test port to avoid conflict
  
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
    // 1. Health check
    console.log('\n[1] Health Endpoint Verification');
    const healthRes = await fetch(`${baseURL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthData.success === true, 'GET /api/health response envelope success is true');
    assert(healthData.data.status === 'healthy', 'GET /api/health data.status is healthy');
    assert(healthData.data.service === 'medicare-plus-backend', 'GET /api/health reports correct service');

    // 2. User Theme Preference Endpoints
    console.log('\n[2] User Theme Preference Verification');
    // 2a. Default theme
    const themeRes1 = await fetch(`${baseURL}/settings/theme`);
    const themeData1 = await themeRes1.json();
    assert(themeRes1.status === 200, 'GET /api/settings/theme returns 200 OK');
    assert(themeData1.data.themeMode === 'light', 'Default user starts with light theme');

    // 2b. Update User A to dark
    const putResA = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'doctor-sarah' },
      body: JSON.stringify({ themeMode: 'dark' }),
    });
    const putDataA = await putResA.json();
    assert(putResA.status === 200, 'PUT /api/settings/theme updates user theme to dark');
    assert(putDataA.data.themeMode === 'dark', 'PUT response reports dark mode');

    // 2c. Update User B to light
    const putResB = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'nurse-priya' },
      body: JSON.stringify({ themeMode: 'light' }),
    });
    const putDataB = await putResB.json();
    assert(putResB.status === 200 && putDataB.data.themeMode === 'light', 'PUT /api/settings/theme updates nurse-priya to light');

    // 2d. Verify User Isolation (User A is dark, User B is light)
    const getResA = await fetch(`${baseURL}/settings/theme`, {
      headers: { 'x-user-id': 'doctor-sarah' },
    });
    const getDataA = await getResA.json();
    assert(getDataA.data.themeMode === 'dark', 'Independent check: doctor-sarah remains dark');

    const getResB = await fetch(`${baseURL}/settings/theme`, {
      headers: { 'x-user-id': 'nurse-priya' },
    });
    const getDataB = await getResB.json();
    assert(getDataB.data.themeMode === 'light', 'Independent check: nurse-priya remains light');

    // 2e. Invalid theme validation (rejection test)
    const invalidPutRes = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'doctor-sarah' },
      body: JSON.stringify({ themeMode: 'neon-cyberpunk' }),
    });
    const invalidPutData = await invalidPutRes.json();
    assert(invalidPutRes.status === 400, 'PUT /api/settings/theme rejects invalid theme with 400 Bad Request');
    assert(invalidPutData.success === false, 'Invalid theme response success is false');

    // 3. Modular Routes Verification
    console.log('\n[3] Modular Routes Verification');
    // Patients
    const patientsRes = await fetch(`${baseURL}/patients`);
    const patientsData = await patientsRes.json();
    assert(patientsRes.status === 200 && Array.isArray(patientsData.data), 'GET /api/patients returns list');

    // Add Patient
    const postPatientRes = await fetch(`${baseURL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Testing Patient', gender: 'Female', age: 29 }),
    });
    const postPatientData = await postPatientRes.json();
    assert(postPatientRes.status === 201 && postPatientData.data.name === 'Testing Patient', 'POST /api/patients creates new patient');

    // Doctors
    const doctorsRes = await fetch(`${baseURL}/doctors`);
    const doctorsData = await doctorsRes.json();
    assert(doctorsRes.status === 200 && Array.isArray(doctorsData.data), 'GET /api/doctors returns list');

    // Departments
    const deptRes = await fetch(`${baseURL}/departments`);
    const deptData = await deptRes.json();
    assert(deptRes.status === 200 && deptData.data.length >= 5, 'GET /api/departments returns clinical departments');

    // Appointments
    const aptRes = await fetch(`${baseURL}/appointments`);
    const aptData = await aptRes.json();
    assert(aptRes.status === 200 && Array.isArray(aptData.data), 'GET /api/appointments returns list');

    // Admissions
    const admRes = await fetch(`${baseURL}/admissions`);
    const admData = await admRes.json();
    assert(admRes.status === 200 && Array.isArray(admData.data), 'GET /api/admissions returns list');

    // Billing / Invoices
    const billRes = await fetch(`${baseURL}/billing`);
    const billData = await billRes.json();
    assert(billRes.status === 200 && Array.isArray(billData.data), 'GET /api/billing returns invoices list');

    // Pharmacy / Inventory
    const pharmRes = await fetch(`${baseURL}/pharmacy`);
    const pharmData = await pharmRes.json();
    assert(pharmRes.status === 200 && Array.isArray(pharmData.data), 'GET /api/pharmacy returns medicines list');

    // Staff
    const staffRes = await fetch(`${baseURL}/staff`);
    const staffData = await staffRes.json();
    assert(staffRes.status === 200 && Array.isArray(staffData.data), 'GET /api/staff returns staff list');

    // Reports
    const repRes = await fetch(`${baseURL}/reports/summary`);
    const repData = await repRes.json();
    assert(repRes.status === 200 && repData.data.totalPatients > 0, 'GET /api/reports/summary returns metrics');

    // 4. 404 Route handling
    console.log('\n[4] Centralized 404 Handling');
    const unknownRes = await fetch(`${baseURL}/non-existent-endpoint`);
    const unknownData = await unknownRes.json();
    assert(unknownRes.status === 404, 'Unknown endpoint returns 404 Not Found');
    assert(unknownData.success === false, 'Unknown endpoint response success is false');

    console.log(`\n=============================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================`);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    failed++;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTests();

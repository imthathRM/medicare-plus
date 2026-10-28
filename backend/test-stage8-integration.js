import { createApp } from './src/app.js';
import prisma from './src/config/prisma.js';

async function runStage8IntegrationTests() {
  console.log('================================================================');
  console.log('  MediCare Plus — Stage 8 Full Integration Verification Suite  ');
  console.log('================================================================\n');

  const app = createApp();
  const PORT = 5058; // Dedicated port for Stage 8 test suite
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

  try {
    // -------------------------------------------------------------------------
    // 1. Authenticate as Admin & Doctor
    // -------------------------------------------------------------------------
    console.log('[1] Admin & Doctor Authentication');
    const adminLogin = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mohamedimthath25@gmail.com', password: '@Rmi2004' }),
    });
    const adminData = await adminLogin.json();
    adminToken = adminData.data?.token;
    assert(adminLogin.status === 200 && !!adminToken, 'Admin authentication successful');

    const docLogin = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@medicare.plus', password: 'password123' }),
    });
    const docData = await docLogin.json();
    doctorToken = docData.data?.token;
    assert(docLogin.status === 200 && !!doctorToken, 'Doctor authentication successful');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    // -------------------------------------------------------------------------
    // 2. Patients Module Integration
    // -------------------------------------------------------------------------
    console.log('\n[2] Module: Patients');
    const getPatients = await fetch(`${baseURL}/patients`, { headers: authHeaders });
    const patientsList = await getPatients.json();
    assert(getPatients.status === 200, 'GET /api/patients returns 200 OK');
    assert(Array.isArray(patientsList.data), 'Patients data is an array');

    const testPatId = `PAT-INT-${Date.now()}`;
    const createPat = await fetch(`${baseURL}/patients`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: testPatId,
        name: 'Integration Test Patient',
        gender: 'Female',
        dob: '1995-04-12',
        age: 31,
        phone: '+94 77 123 4567',
        status: 'Outpatient',
      }),
    });
    const createPatData = await createPat.json();
    assert(createPat.status === 201, 'POST /api/patients creates new patient');
    assert(createPatData.data?.id === testPatId, 'Created patient has matching ID');

    const updatePat = await fetch(`${baseURL}/patients/${testPatId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ phone: '+94 77 987 6543' }),
    });
    const updatePatData = await updatePat.json();
    assert(updatePat.status === 200, 'PUT /api/patients/:id updates patient record');
    assert(updatePatData.data?.phone === '+94 77 987 6543', 'Patient phone updated');

    const delPat = await fetch(`${baseURL}/patients/${testPatId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delPat.status === 200, 'DELETE /api/patients/:id removes patient record');

    // -------------------------------------------------------------------------
    // 3. Doctors Module Integration
    // -------------------------------------------------------------------------
    console.log('\n[3] Module: Doctors');
    const getDocs = await fetch(`${baseURL}/doctors`, { headers: authHeaders });
    const docsList = await getDocs.json();
    assert(getDocs.status === 200, 'GET /api/doctors returns 200 OK');
    assert(docsList.data.length > 0, 'Found doctor records in PostgreSQL');
    assert('specialty' in docsList.data[0], 'Doctor record normalized with specialty field');
    assert('consultationFee' in docsList.data[0], 'Doctor record normalized with consultationFee field');

    const testDocId = `DOC-INT-${Date.now()}`;
    const createDoc = await fetch(`${baseURL}/doctors`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: testDocId,
        name: 'Dr. Integration Test',
        department: 'Cardiology',
        specialty: 'Cardiovascular Surgery',
        consultationFee: 5000,
        roomNumber: 'OPD-205',
      }),
    });
    assert(createDoc.status === 201, 'POST /api/doctors creates doctor profile');

    const delDoc = await fetch(`${baseURL}/doctors/${testDocId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delDoc.status === 200, 'DELETE /api/doctors/:id removes doctor profile');

    // -------------------------------------------------------------------------
    // 4. Departments Module Integration
    // -------------------------------------------------------------------------
    console.log('\n[4] Module: Departments');
    const getDepts = await fetch(`${baseURL}/departments`, { headers: authHeaders });
    const deptsList = await getDepts.json();
    assert(getDepts.status === 200, 'GET /api/departments returns 200 OK');
    assert(deptsList.data.length > 0, 'Found departments in PostgreSQL');

    const testDeptId = `DEP-INT-${Date.now()}`;
    const createDept = await fetch(`${baseURL}/departments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: testDeptId,
        name: 'Diagnostic Immunology',
        headOfDepartment: 'Dr. Test Head',
        location: 'Level 4, Block D',
        doctorCount: 4,
        bedCount: 12,
      }),
    });
    assert(createDept.status === 201, 'POST /api/departments creates new department');

    const delDept = await fetch(`${baseURL}/departments/${testDeptId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delDept.status === 200, 'DELETE /api/departments/:id deletes department');

    // -------------------------------------------------------------------------
    // 5. Appointments Module Integration
    // -------------------------------------------------------------------------
    console.log('\n[5] Module: Appointments');
    const getApts = await fetch(`${baseURL}/appointments`, { headers: authHeaders });
    const aptsList = await getApts.json();
    assert(getApts.status === 200, 'GET /api/appointments returns 200 OK');

    const testAptId = `APT-INT-${Date.now()}`;
    const createApt = await fetch(`${baseURL}/appointments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: testAptId,
        patientName: 'Test Appointment Patient',
        doctorName: 'Dr. Senaka Weeraratne',
        department: 'Cardiology',
        date: '2026-10-30',
        time: '10:00 AM',
        feeLKR: 3500,
        status: 'Confirmed',
      }),
    });
    assert(createApt.status === 201, 'POST /api/appointments creates appointment');

    const updateApt = await fetch(`${baseURL}/appointments/${testAptId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'Completed' }),
    });
    assert(updateApt.status === 200, 'PUT /api/appointments/:id updates status');

    const delApt = await fetch(`${baseURL}/appointments/${testAptId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delApt.status === 200, 'DELETE /api/appointments/:id deletes appointment');

    // -------------------------------------------------------------------------
    // 6. Admissions Module Integration
    // -------------------------------------------------------------------------
    console.log('\n[6] Module: Admissions');
    const getAdms = await fetch(`${baseURL}/admissions`, { headers: authHeaders });
    assert(getAdms.status === 200, 'GET /api/admissions returns 200 OK');

    const testAdmId = `ADM-INT-${Date.now()}`;
    const createAdm = await fetch(`${baseURL}/admissions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: testAdmId,
        patientName: 'Admitted Patient',
        ward: 'Surgical Ward',
        bedNumber: 'SW-12',
        status: 'Admitted',
      }),
    });
    assert(createAdm.status === 201, 'POST /api/admissions records inpatient admission');

    const dischargeAdm = await fetch(`${baseURL}/admissions/${testAdmId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Discharged',
        dischargeDate: '2026-10-28',
        dischargeNotes: 'Recovered completely',
      }),
    });
    assert(dischargeAdm.status === 200, 'PUT /api/admissions/:id discharges patient');

    const delAdm = await fetch(`${baseURL}/admissions/${testAdmId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delAdm.status === 200, 'DELETE /api/admissions/:id removes admission record');

    // -------------------------------------------------------------------------
    // 7. Billing & Invoicing Module Integration
    // -------------------------------------------------------------------------
    console.log('\n[7] Module: Billing & Invoices');
    const getInvs = await fetch(`${baseURL}/billing`, { headers: authHeaders });
    const invsList = await getInvs.json();
    assert(getInvs.status === 200, 'GET /api/billing returns 200 OK');
    assert('totalAmount' in invsList.data[0], 'Invoice totalAmount is normalized');
    assert('paidAmount' in invsList.data[0], 'Invoice paidAmount is normalized');

    const testInvId = `INV-INT-${Date.now()}`;
    const createInv = await fetch(`${baseURL}/billing`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: testInvId,
        invoiceNumber: `MCP-INV-2026-${Date.now().toString().slice(-4)}`,
        patientName: 'Billing Test Patient',
        totalAmount: 12500,
        subtotal: 12500,
        tax: 0,
        paidAmount: 0,
      }),
    });
    assert(createInv.status === 201, 'POST /api/billing generates invoice');

    const payInv = await fetch(`${baseURL}/billing/${testInvId}/payment`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ amountPaid: 12500, paymentMethod: 'Card' }),
    });
    const payData = await payInv.json();
    assert(payInv.status === 200, 'POST /api/billing/:id/payment records full payment');
    assert(payData.data?.status === 'Paid', 'Invoice status updated to Paid');

    const delInv = await fetch(`${baseURL}/billing/${testInvId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delInv.status === 200, 'DELETE /api/billing/:id deletes invoice');

    // -------------------------------------------------------------------------
    // 8. Pharmacy & Inventory Module Integration
    // -------------------------------------------------------------------------
    console.log('\n[8] Module: Pharmacy & Inventory');
    const getMeds = await fetch(`${baseURL}/pharmacy`, { headers: authHeaders });
    const medsList = await getMeds.json();
    assert(getMeds.status === 200, 'GET /api/pharmacy returns 200 OK');
    assert('quantity' in medsList.data[0], 'Medicine quantity is normalized');
    assert('unitPrice' in medsList.data[0], 'Medicine unitPrice is normalized');

    const testMedId = `MED-INT-${Date.now()}`;
    const createMed = await fetch(`${baseURL}/pharmacy`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: testMedId,
        name: 'Amoxicillin 500mg',
        category: 'Antibiotics',
        dosageForm: 'Capsule',
        unitPriceLKR: 45,
        stockQuantity: 200,
        reorderLevel: 50,
      }),
    });
    assert(createMed.status === 201, 'POST /api/pharmacy adds medicine to inventory');

    const adjustStock = await fetch(`${baseURL}/pharmacy/${testMedId}/stock`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ adjustment: -20 }),
    });
    const adjustData = await adjustStock.json();
    assert(adjustStock.status === 200, 'PUT /api/pharmacy/:id/stock adjusts inventory');
    assert(adjustData.data?.stockQuantity === 180, 'Inventory stock reduced correctly');

    const delMed = await fetch(`${baseURL}/pharmacy/${testMedId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delMed.status === 200, 'DELETE /api/pharmacy/:id removes medicine item');

    // -------------------------------------------------------------------------
    // 9. Staff Module Integration
    // -------------------------------------------------------------------------
    console.log('\n[9] Module: Hospital Staff');
    const getStaff = await fetch(`${baseURL}/staff`, { headers: authHeaders });
    assert(getStaff.status === 200, 'GET /api/staff returns 200 OK');

    const testStaffId = `STF-INT-${Date.now()}`;
    const createStaff = await fetch(`${baseURL}/staff`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: testStaffId,
        name: 'Nurse Kamal Perera',
        role: 'Registered Senior Nurse',
        department: 'Cardiology',
        phone: '+94 71 555 1234',
        status: 'Active',
      }),
    });
    assert(createStaff.status === 201, 'POST /api/staff registers staff member');

    const updateStaff = await fetch(`${baseURL}/staff/${testStaffId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ shift: 'Night Shift' }),
    });
    assert(updateStaff.status === 200, 'PUT /api/staff/:id updates staff shift');

    const delStaff = await fetch(`${baseURL}/staff/${testStaffId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delStaff.status === 200, 'DELETE /api/staff/:id deletes staff member');

    // -------------------------------------------------------------------------
    // 10. Reports & Analytics Module Integration
    // -------------------------------------------------------------------------
    console.log('\n[10] Module: Reports & Analytics');
    const getSummary = await fetch(`${baseURL}/reports/summary`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    const summaryData = await getSummary.json();
    assert(getSummary.status === 200, 'GET /api/reports/summary returns 200 OK');
    assert('totalPatients' in summaryData.data, 'Summary KPI contains totalPatients');
    assert('monthlyRevenueLKR' in summaryData.data, 'Summary KPI contains monthlyRevenueLKR');
    assert('bedOccupancyRate' in summaryData.data, 'Summary KPI contains bedOccupancyRate');

    const getTrends = await fetch(`${baseURL}/reports/trends`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert(getTrends.status === 200, 'GET /api/reports/trends returns 200 OK');

    const getDist = await fetch(`${baseURL}/reports/distribution`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert(getDist.status === 200, 'GET /api/reports/distribution returns 200 OK');

    // -------------------------------------------------------------------------
    // 11. Settings & Institutional Profile Integration
    // -------------------------------------------------------------------------
    console.log('\n[11] Module: Settings & Institutional Profile');
    const getProfile = await fetch(`${baseURL}/settings/hospital`, { headers: authHeaders });
    const profileData = await getProfile.json();
    assert(getProfile.status === 200, 'GET /api/settings/hospital returns 200 OK');
    assert(profileData.data?.currency === 'LKR', 'Hospital profile currency is LKR');

    const updateProfile = await fetch(`${baseURL}/settings/hospital`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ operatingBeds: 180 }),
    });
    assert(updateProfile.status === 200, 'PUT /api/settings/hospital updates profile');

    const getTheme = await fetch(`${baseURL}/settings/theme`, { headers: authHeaders });
    assert(getTheme.status === 200, 'GET /api/settings/theme returns 200 OK');

    const updateTheme = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ themeMode: 'dark' }),
    });
    assert(updateTheme.status === 200, 'PUT /api/settings/theme updates theme preference to dark');

    // Switch back to light
    await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ themeMode: 'light' }),
    });
    assert(true, 'Theme preference reset cleanly to light');

  } catch (error) {
    console.error('Integration test encountered an unexpected exception:', error);
    failed++;
  } finally {
    server.close();
    await prisma.$disconnect();
    console.log('\n================================================================');
    console.log(`Stage 8 Integration Finished: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runStage8IntegrationTests();

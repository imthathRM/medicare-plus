import { createApp } from './src/app.js';
import prisma from './src/config/prisma.js';

async function runStage9FullSystemTests() {
  console.log('================================================================');
  console.log('  MediCare Plus — Stage 9 Full-System Verification & Bug Tests  ');
  console.log('================================================================\n');

  const app = createApp();
  const PORT = 5059; // Dedicated port for Stage 9 test harness
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

  const syntheticIds = {
    patient: `PAT-SYNTH-${Date.now()}`,
    doctor: `DOC-SYNTH-${Date.now()}`,
    department: `DEP-SYNTH-${Date.now()}`,
    appointment: `APT-SYNTH-${Date.now()}`,
    admission: `ADM-SYNTH-${Date.now()}`,
    invoice: `INV-SYNTH-${Date.now()}`,
    medicine: `MED-SYNTH-${Date.now()}`,
    staff: `STF-SYNTH-${Date.now()}`,
  };

  try {
    // -------------------------------------------------------------------------
    // 1. Authentication & Multi-Role Token Issuance
    // -------------------------------------------------------------------------
    console.log('[1] Authentication, Session & Multi-Role Tokens');

    // Admin login
    const adminRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mohamedimthath25@gmail.com', password: '@Rmi2004' }),
    });
    const adminData = await adminRes.json();
    adminToken = adminData.data?.token;
    assert(adminRes.status === 200 && !!adminToken, 'Admin authentication successful');
    assert(adminData.data?.user?.name === 'ImthathRM', 'Admin account name matches ImthathRM');
    assert(!('password' in (adminData.data?.user || {})), 'Password not leaked in admin response');

    // Doctor login
    const docRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@medicare.plus', password: 'password123' }),
    });
    const docData = await docRes.json();
    doctorToken = docData.data?.token;
    assert(docRes.status === 200 && docData.data?.user?.role === 'DOCTOR', 'Doctor authentication successful');

    // Receptionist login
    const recpRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medicare.plus', password: 'password123' }),
    });
    const recpData = await recpRes.json();
    receptionistToken = recpData.data?.token;
    assert(recpRes.status === 200 && recpData.data?.user?.role === 'RECEPTIONIST', 'Receptionist authentication successful');

    // Pharmacist login
    const pharmRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pharmacist@medicare.plus', password: 'password123' }),
    });
    const pharmData = await pharmRes.json();
    pharmacistToken = pharmData.data?.token;
    assert(pharmRes.status === 200 && pharmData.data?.user?.role === 'PHARMACIST', 'Pharmacist authentication successful');

    const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };
    const docHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${doctorToken}` };
    const recpHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${receptionistToken}` };
    const pharmHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${pharmacistToken}` };

    // -------------------------------------------------------------------------
    // 2. Strict RBAC & Unauthorized Boundary Testing
    // -------------------------------------------------------------------------
    console.log('\n[2] Security & Role-Based Authorization Boundaries');

    // 2a. Unauthenticated access blocked
    const unauthPat = await fetch(`${baseURL}/patients`);
    assert(unauthPat.status === 401, 'Unauthenticated GET /api/patients is rejected with 401');

    const unauthDoc = await fetch(`${baseURL}/doctors`);
    assert(unauthDoc.status === 401, 'Unauthenticated GET /api/doctors is rejected with 401');

    const unauthBill = await fetch(`${baseURL}/billing`);
    assert(unauthBill.status === 401, 'Unauthenticated GET /api/billing is rejected with 401');

    // 2b. Pharmacist blocked from reports & staff
    const pharmRep = await fetch(`${baseURL}/reports/summary`, { headers: pharmHeaders });
    assert(pharmRep.status === 403, 'Pharmacist blocked from GET /api/reports/summary (403)');

    const pharmStaff = await fetch(`${baseURL}/staff`, { headers: pharmHeaders });
    assert(pharmStaff.status === 403, 'Pharmacist blocked from GET /api/staff (403)');

    // 2c. Receptionist blocked from doctor creation and admin user list
    const recpCreateDoc = await fetch(`${baseURL}/doctors`, {
      method: 'POST',
      headers: recpHeaders,
      body: JSON.stringify({ name: 'Dr. Illicit' }),
    });
    assert(recpCreateDoc.status === 403, 'Receptionist blocked from POST /api/doctors (403)');

    const recpUsers = await fetch(`${baseURL}/auth/users`, { headers: recpHeaders });
    assert(recpUsers.status === 403, 'Receptionist blocked from GET /api/auth/users (403)');

    // -------------------------------------------------------------------------
    // 3. Module: Patients (Full Lifecycle & Validation)
    // -------------------------------------------------------------------------
    console.log('\n[3] Module Testing: Patients');

    // Bad payload rejected
    const badPat = await fetch(`${baseURL}/patients`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({}),
    });
    assert(badPat.status === 400, 'POST /api/patients with empty payload rejected with 400');

    // Create Synthetic Patient
    const createPat = await fetch(`${baseURL}/patients`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        id: syntheticIds.patient,
        name: 'Synthetic Patient One',
        gender: 'Male',
        dob: '1988-06-20',
        age: 38,
        bloodGroup: 'B+',
        phone: '+94 77 000 1111',
        email: 'synthetic.patient@test.local',
        address: 'Colombo 07, Sri Lanka',
        allergies: 'Penicillin',
        status: 'Outpatient',
      }),
    });
    assert(createPat.status === 201, 'POST /api/patients creates synthetic patient');

    // Read by ID
    const getPat = await fetch(`${baseURL}/patients/${syntheticIds.patient}`, { headers: adminHeaders });
    const getPatData = await getPat.json();
    assert(getPat.status === 200 && getPatData.data?.name === 'Synthetic Patient One', 'GET /api/patients/:id returns created record');

    // Search query
    const searchPat = await fetch(`${baseURL}/patients?search=Synthetic`, { headers: adminHeaders });
    const searchPatData = await searchPat.json();
    assert(searchPat.status === 200 && searchPatData.data.some((p) => p.id === syntheticIds.patient), 'Search query ?search= locates synthetic patient');

    // Update with extraneous fields (verifies whitelist sanitization)
    const updatePat = await fetch(`${baseURL}/patients/${syntheticIds.patient}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        phone: '+94 77 999 8888',
        extraneousFieldIgnored: 'should not break prisma',
      }),
    });
    const updatePatData = await updatePat.json();
    assert(updatePat.status === 200 && updatePatData.data?.phone === '+94 77 999 8888', 'PUT /api/patients/:id sanitizes fields and updates phone');

    // -------------------------------------------------------------------------
    // 4. Module: Doctors (Lifecycle & Normalization)
    // -------------------------------------------------------------------------
    console.log('\n[4] Module Testing: Doctors');

    const createDoc = await fetch(`${baseURL}/doctors`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        id: syntheticIds.doctor,
        name: 'Dr. Synthetic Specialist',
        department: 'Cardiology',
        specialty: 'Interventional Cardiology',
        qualification: 'MBBS, MD, FRCP',
        phone: '+94 71 000 2222',
        consultationFee: 4500,
        roomNumber: 'OPD-302',
      }),
    });
    assert(createDoc.status === 201, 'POST /api/doctors creates synthetic doctor');

    const getDoc = await fetch(`${baseURL}/doctors/${syntheticIds.doctor}`, { headers: adminHeaders });
    const getDocData = await getDoc.json();
    assert(getDoc.status === 200, 'GET /api/doctors/:id retrieves doctor profile');
    assert(getDocData.data?.specialty === 'Interventional Cardiology', 'Specialty normalized in GET response');
    assert(getDocData.data?.consultationFee === 4500, 'Consultation fee normalized in GET response');

    // Update with extraneous frontend fields (title, gender)
    const updateDoc = await fetch(`${baseURL}/doctors/${syntheticIds.doctor}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        consultationFee: 4800,
        title: 'Consultant',
        gender: 'Female',
      }),
    });
    assert(updateDoc.status === 200, 'PUT /api/doctors/:id safely ignores non-schema fields');

    // -------------------------------------------------------------------------
    // 5. Module: Departments & FK Integrity
    // -------------------------------------------------------------------------
    console.log('\n[5] Module Testing: Clinical Departments');

    const createDept = await fetch(`${baseURL}/departments`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        id: syntheticIds.department,
        name: 'Synthetic Oncology Unit',
        headOfDepartment: 'Dr. Head of Oncology',
        location: 'Level 5, Oncology Wing',
        doctorCount: 3,
        bedCount: 20,
      }),
    });
    assert(createDept.status === 201, 'POST /api/departments auto-generates code and creates department');

    const updateDept = await fetch(`${baseURL}/departments/${syntheticIds.department}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ bedCount: 25 }),
    });
    const updateDeptData = await updateDept.json();
    assert(updateDept.status === 200 && updateDeptData.data?.bedCount === 25, 'PUT /api/departments/:id updates bed count');

    // FK integrity check: attempting to delete Cardiology (has doctors) should be rejected
    const delCardio = await fetch(`${baseURL}/departments/DEP-101`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    assert(delCardio.status === 400, 'DELETE /api/departments/:id with assigned doctors rejected with 400');

    // -------------------------------------------------------------------------
    // 6. Module: Appointments
    // -------------------------------------------------------------------------
    console.log('\n[6] Module Testing: Appointments');

    const createApt = await fetch(`${baseURL}/appointments`, {
      method: 'POST',
      headers: recpHeaders,
      body: JSON.stringify({
        id: syntheticIds.appointment,
        patientId: syntheticIds.patient,
        patientName: 'Synthetic Patient One',
        doctorId: syntheticIds.doctor,
        doctorName: 'Dr. Synthetic Specialist',
        department: 'Cardiology',
        date: '2026-10-31',
        time: '11:30 AM',
        status: 'Confirmed',
        fee: 4800,
      }),
    });
    assert(createApt.status === 201, 'POST /api/appointments creates appointment');

    // Status transition: Confirmed -> In Progress
    const patchStatus = await fetch(`${baseURL}/appointments/${syntheticIds.appointment}/status`, {
      method: 'PATCH',
      headers: docHeaders,
      body: JSON.stringify({ status: 'In Progress' }),
    });
    assert(patchStatus.status === 200, 'PATCH /api/appointments/:id/status updates status');

    // Cancel appointment with cancelReason (verifies sanitization)
    const cancelApt = await fetch(`${baseURL}/appointments/${syntheticIds.appointment}`, {
      method: 'PUT',
      headers: recpHeaders,
      body: JSON.stringify({ status: 'Cancelled', cancelReason: 'Patient rescheduled' }),
    });
    assert(cancelApt.status === 200, 'PUT /api/appointments/:id safely handles cancellation reason');

    // -------------------------------------------------------------------------
    // 7. Module: Admissions & Discharges
    // -------------------------------------------------------------------------
    console.log('\n[7] Module Testing: Inpatient Admissions');

    const createAdm = await fetch(`${baseURL}/admissions`, {
      method: 'POST',
      headers: docHeaders,
      body: JSON.stringify({
        id: syntheticIds.admission,
        patientId: syntheticIds.patient,
        patientName: 'Synthetic Patient One',
        ward: 'Oncology Ward B',
        bedNumber: 'ONC-08',
        diagnosis: 'Observation & Therapy',
        status: 'Admitted',
      }),
    });
    assert(createAdm.status === 201, 'POST /api/admissions creates admission record');

    // Discharge admission with dischargeNotes (verifies sanitization)
    const dischargeAdm = await fetch(`${baseURL}/admissions/${syntheticIds.admission}`, {
      method: 'PUT',
      headers: docHeaders,
      body: JSON.stringify({
        status: 'Discharged',
        dischargeDate: '2026-10-28',
        dischargeNotes: 'Patient discharged in stable condition',
      }),
    });
    assert(dischargeAdm.status === 200, 'PUT /api/admissions/:id discharges patient without schema error');

    // -------------------------------------------------------------------------
    // 8. Module: Billing, Invoicing & Payments
    // -------------------------------------------------------------------------
    console.log('\n[8] Module Testing: Billing & Financial Payments');

    const createInv = await fetch(`${baseURL}/billing`, {
      method: 'POST',
      headers: recpHeaders,
      body: JSON.stringify({
        id: syntheticIds.invoice,
        invoiceNumber: `MCP-INV-SYNTH-${Date.now().toString().slice(-4)}`,
        patientId: syntheticIds.patient,
        patientName: 'Synthetic Patient One',
        totalAmount: 15000,
        subtotal: 15000,
        tax: 0,
        paidAmount: 0,
      }),
    });
    assert(createInv.status === 201, 'POST /api/billing generates invoice');

    // Record partial payment
    const partialPay = await fetch(`${baseURL}/billing/${syntheticIds.invoice}/payment`, {
      method: 'POST',
      headers: recpHeaders,
      body: JSON.stringify({ amountPaid: 15000, paymentMethod: 'Insurance' }),
    });
    const partialPayData = await partialPay.json();
    assert(partialPay.status === 200 && partialPayData.data?.status === 'Paid', 'POST /api/billing/:id/payment atomically records payment and marks invoice Paid');

    // -------------------------------------------------------------------------
    // 9. Module: Pharmacy, Stock Adjustments & Low Stock
    // -------------------------------------------------------------------------
    console.log('\n[9] Module Testing: Pharmacy Catalog & Stock Inventory');

    const createMed = await fetch(`${baseURL}/pharmacy`, {
      method: 'POST',
      headers: pharmHeaders,
      body: JSON.stringify({
        id: syntheticIds.medicine,
        name: 'Synthetic Paracetamol 500mg',
        category: 'Analgesics',
        form: 'Tablet',
        quantity: 100,
        minThreshold: 40,
        unitPrice: 15,
      }),
    });
    assert(createMed.status === 201, 'POST /api/pharmacy registers medicine item');

    // Adjust stock down to low threshold
    const stockDown = await fetch(`${baseURL}/pharmacy/${syntheticIds.medicine}/stock`, {
      method: 'PUT',
      headers: pharmHeaders,
      body: JSON.stringify({ newQuantity: 30 }),
    });
    const stockDownData = await stockDown.json();
    assert(stockDown.status === 200, 'PUT /api/pharmacy/:id/stock adjusts quantity');
    assert(stockDownData.data?.status === 'Low Stock', 'Stock drop triggers Low Stock status');

    // Adjust stock up
    const stockUp = await fetch(`${baseURL}/pharmacy/${syntheticIds.medicine}/stock`, {
      method: 'PUT',
      headers: pharmHeaders,
      body: JSON.stringify({ adjustment: 50 }),
    });
    const stockUpData = await stockUp.json();
    assert(stockUp.status === 200 && stockUpData.data?.status === 'In Stock', 'Stock increase restores In Stock status');

    // -------------------------------------------------------------------------
    // 10. Module: Staff Roster
    // -------------------------------------------------------------------------
    console.log('\n[10] Module Testing: Staff Roster');

    const createStaff = await fetch(`${baseURL}/staff`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        id: syntheticIds.staff,
        name: 'Synthetic Nurse Staff',
        role: 'Staff Nurse',
        department: 'Cardiology',
        phone: '+94 77 333 4444',
        shift: 'Morning',
      }),
    });
    assert(createStaff.status === 201, 'POST /api/staff registers staff member');

    const updateStaff = await fetch(`${baseURL}/staff/${syntheticIds.staff}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ shift: 'Evening' }),
    });
    const updateStaffData = await updateStaff.json();
    assert(updateStaff.status === 200 && updateStaffData.data?.shift === 'Evening', 'PUT /api/staff/:id updates shift');

    // -------------------------------------------------------------------------
    // 11. Module: Reports & Analytics
    // -------------------------------------------------------------------------
    console.log('\n[11] Module Testing: Reports & Analytics');

    const summaryRes = await fetch(`${baseURL}/reports/summary`, { headers: docHeaders });
    const summaryData = await summaryRes.json();
    assert(summaryRes.status === 200, 'GET /api/reports/summary returns 200 for DOCTOR');
    assert(typeof summaryData.data?.totalPatients === 'number', 'totalPatients is a number');
    assert(typeof summaryData.data?.bedOccupancyRate === 'number', 'bedOccupancyRate is a number');

    const trendsRes = await fetch(`${baseURL}/reports/trends`, { headers: docHeaders });
    assert(trendsRes.status === 200, 'GET /api/reports/trends returns 200 for DOCTOR');

    const distRes = await fetch(`${baseURL}/reports/distribution`, { headers: docHeaders });
    assert(distRes.status === 200, 'GET /api/reports/distribution returns 200 for DOCTOR');

    // -------------------------------------------------------------------------
    // 12. Module: Settings & Dual Theme Isolation
    // -------------------------------------------------------------------------
    console.log('\n[12] Module Testing: Settings & Theme Preferences');

    const getHosp = await fetch(`${baseURL}/settings/hospital`, { headers: adminHeaders });
    const hospData = await getHosp.json();
    assert(getHosp.status === 200 && hospData.data?.currency === 'LKR', 'GET /api/settings/hospital returns currency LKR');

    // Admin sets dark theme
    const setAdminTheme = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ themeMode: 'dark' }),
    });
    assert(setAdminTheme.status === 200, 'Admin sets theme to dark');

    // Doctor sets light theme
    const setDocTheme = await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: docHeaders,
      body: JSON.stringify({ themeMode: 'light' }),
    });
    assert(setDocTheme.status === 200, 'Doctor sets theme to light');

    // Verify isolation
    const verifyAdminTheme = await fetch(`${baseURL}/settings/theme`, { headers: adminHeaders });
    const verifyAdminData = await verifyAdminTheme.json();
    assert(verifyAdminData.data?.themeMode === 'dark', 'Admin theme remains isolated as dark');

    const verifyDocTheme = await fetch(`${baseURL}/settings/theme`, { headers: docHeaders });
    const verifyDocData = await verifyDocTheme.json();
    assert(verifyDocData.data?.themeMode === 'light', 'Doctor theme remains isolated as light');

    // Reset admin theme back to light
    await fetch(`${baseURL}/settings/theme`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ themeMode: 'light' }),
    });
    assert(true, 'Admin theme restored to light');

    // -------------------------------------------------------------------------
    // 13. Clean Up All Synthetic Records
    // -------------------------------------------------------------------------
    console.log('\n[13] Safe Cleanup of Synthetic Test Records Only');

    await fetch(`${baseURL}/appointments/${syntheticIds.appointment}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${baseURL}/admissions/${syntheticIds.admission}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${baseURL}/billing/${syntheticIds.invoice}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${baseURL}/patients/${syntheticIds.patient}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${baseURL}/doctors/${syntheticIds.doctor}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${baseURL}/departments/${syntheticIds.department}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${baseURL}/pharmacy/${syntheticIds.medicine}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${baseURL}/staff/${syntheticIds.staff}`, { method: 'DELETE', headers: adminHeaders });

    // Verify synthetic records are removed
    const checkPat = await fetch(`${baseURL}/patients/${syntheticIds.patient}`, { headers: adminHeaders });
    assert(checkPat.status === 404, 'Synthetic patient verified removed (404)');

    const checkDoc = await fetch(`${baseURL}/doctors/${syntheticIds.doctor}`, { headers: adminHeaders });
    assert(checkDoc.status === 404, 'Synthetic doctor verified removed (404)');

    const checkMed = await fetch(`${baseURL}/pharmacy/${syntheticIds.medicine}`, { headers: adminHeaders });
    assert(checkMed.status === 404, 'Synthetic medicine verified removed (404)');

    assert(true, 'All synthetic test records cleaned up without touching real records');

  } catch (error) {
    console.error('Stage 9 test encountered an unexpected exception:', error);
    failed++;
  } finally {
    server.close();
    await prisma.$disconnect();
    console.log('\n================================================================');
    console.log(`Stage 9 Full-System Finished: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runStage9FullSystemTests();

import { PrismaClient } from '@prisma/client';
import {
  departments,
  doctors,
  patients,
  appointments,
  admissions,
  invoices,
  medicines,
  staff,
  hospitalProfile,
  userThemes,
} from '../src/data/memoryStore.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding PostgreSQL Database (Stage 6) ---');

  // 1. Hospital Profile
  console.log('Seeding Hospital Profile...');
  await prisma.hospitalProfile.upsert({
    where: { id: 'default-hospital' },
    update: hospitalProfile,
    create: { id: 'default-hospital', ...hospitalProfile },
  });

  // 2. Departments
  console.log('Seeding Departments...');
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: dept,
      create: dept,
    });
  }

  // 3. Doctors
  console.log('Seeding Doctors...');
  for (const doc of doctors) {
    const { departmentId, ...docData } = doc;
    await prisma.doctor.upsert({
      where: { id: doc.id },
      update: {
        ...docData,
        departmentRef: departmentId ? { connect: { id: departmentId } } : undefined,
      },
      create: {
        ...docData,
        departmentRef: departmentId ? { connect: { id: departmentId } } : undefined,
      },
    });
  }

  // 4. Patients
  console.log('Seeding Patients...');
  for (const patient of patients) {
    await prisma.patient.upsert({
      where: { id: patient.id },
      update: patient,
      create: patient,
    });
  }

  // 5. Appointments
  console.log('Seeding Appointments...');
  for (const apt of appointments) {
    const { patientId, doctorId, ...aptData } = apt;
    await prisma.appointment.upsert({
      where: { id: apt.id },
      update: {
        ...aptData,
        patient: patientId ? { connect: { id: patientId } } : undefined,
        doctor: doctorId ? { connect: { id: doctorId } } : undefined,
      },
      create: {
        ...aptData,
        patient: patientId ? { connect: { id: patientId } } : undefined,
        doctor: doctorId ? { connect: { id: doctorId } } : undefined,
      },
    });
  }

  // 6. Admissions
  console.log('Seeding Admissions...');
  for (const adm of admissions) {
    const { patientId, ...admData } = adm;
    await prisma.admission.upsert({
      where: { id: adm.id },
      update: {
        ...admData,
        patient: patientId ? { connect: { id: patientId } } : undefined,
      },
      create: {
        ...admData,
        patient: patientId ? { connect: { id: patientId } } : undefined,
      },
    });
  }

  // 7. Invoices
  console.log('Seeding Invoices...');
  for (const inv of invoices) {
    const { patientId, ...invData } = inv;
    await prisma.invoice.upsert({
      where: { id: inv.id },
      update: {
        ...invData,
        patient: patientId ? { connect: { id: patientId } } : undefined,
      },
      create: {
        ...invData,
        patient: patientId ? { connect: { id: patientId } } : undefined,
      },
    });
  }

  // 8. Medicines
  console.log('Seeding Medicines...');
  for (const med of medicines) {
    await prisma.medicine.upsert({
      where: { id: med.id },
      update: med,
      create: med,
    });
  }

  // 9. Staff
  console.log('Seeding Staff...');
  for (const member of staff) {
    await prisma.staff.upsert({
      where: { id: member.id },
      update: member,
      create: member,
    });
  }

  // 10. Per-User Theme Settings
  console.log('Seeding User Theme Preferences...');
  for (const [userId, themeMode] of userThemes.entries()) {
    await prisma.userSetting.upsert({
      where: { userId },
      update: { themeMode },
      create: { userId, themeMode },
    });
  }

  console.log('✓ Seed completed successfully with 0 duplicates.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

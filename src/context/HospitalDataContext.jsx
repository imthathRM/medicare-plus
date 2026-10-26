import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  initialDepartments,
  initialDoctors,
  initialPatients,
  initialAppointments,
  initialAdmissions,
  initialInvoices,
  initialMedicines,
  initialStaff,
  initialHospitalProfile,
  initialAppSettings,
} from '../data';
import { useToast } from './ToastContext';

const HospitalDataContext = createContext(null);

export const HospitalDataProvider = ({ children }) => {
  const { success, info } = useToast();

  const [patients, setPatients] = useState(initialPatients);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [departments, setDepartments] = useState(initialDepartments);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [admissions, setAdmissions] = useState(initialAdmissions);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [medicines, setMedicines] = useState(initialMedicines);
  const [staff, setStaff] = useState(initialStaff);
  const [hospitalProfile, setHospitalProfile] = useState(initialHospitalProfile);
  const [appSettings, setAppSettings] = useState(initialAppSettings);

  // --- Patients CRUD ---
  const addPatient = (patientData) => {
    const newId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatient = {
      ...patientData,
      id: newId,
      registeredDate: new Date().toISOString().split('T')[0],
      status: patientData.status || 'Outpatient',
    };
    setPatients((prev) => [newPatient, ...prev]);
    success('Patient Registered', `${newPatient.name} has been enrolled as ${newPatient.id}.`);
    return newPatient;
  };

  const updatePatient = (id, updatedData) => {
    setPatients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
    success('Patient Updated', `Record for ${updatedData.name || id} was updated.`);
  };

  const deletePatient = (id) => {
    const target = patients.find((p) => p.id === id);
    setPatients((prev) => prev.filter((item) => item.id !== id));
    info('Patient Removed', `Record for ${target?.name || id} was deleted from active registry.`);
  };

  // --- Doctors CRUD ---
  const addDoctor = (doctorData) => {
    const newId = `DOC-${Math.floor(200 + Math.random() * 800)}`;
    const newDoc = {
      ...doctorData,
      id: newId,
      totalPatients: 0,
      status: doctorData.status || 'Available',
    };
    setDoctors((prev) => [newDoc, ...prev]);
    success('Doctor Registered', `${newDoc.name} added to ${newDoc.department}.`);
    return newDoc;
  };

  const updateDoctor = (id, updatedData) => {
    setDoctors((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updatedData } : doc))
    );
    success('Doctor Updated', `Profile for ${updatedData.name || id} has been updated.`);
  };

  const deleteDoctor = (id) => {
    const target = doctors.find((d) => d.id === id);
    setDoctors((prev) => prev.filter((d) => d.id !== id));
    info('Doctor Removed', `${target?.name || id} removed from active roster.`);
  };

  // --- Departments CRUD ---
  const addDepartment = (deptData) => {
    const newId = `DEP-${Math.floor(100 + Math.random() * 900)}`;
    const newDept = {
      ...deptData,
      id: newId,
      doctorCount: Number(deptData.doctorCount) || 0,
      bedCount: Number(deptData.bedCount) || 0,
      status: deptData.status || 'Active',
    };
    setDepartments((prev) => [...prev, newDept]);
    success('Department Created', `${newDept.name} department created.`);
    return newDept;
  };

  const updateDepartment = (id, updatedData) => {
    setDepartments((prev) =>
      prev.map((dept) => (dept.id === id ? { ...dept, ...updatedData } : dept))
    );
    success('Department Updated', `${updatedData.name || id} details updated.`);
  };

  // --- Appointments CRUD ---
  const addAppointment = (appointmentData) => {
    const newId = `APT-${Math.floor(500 + Math.random() * 500)}`;
    const newApt = {
      ...appointmentData,
      id: newId,
      status: appointmentData.status || 'Confirmed',
    };
    setAppointments((prev) => [newApt, ...prev]);
    success('Appointment Scheduled', `Booking confirmed for ${newApt.patientName} with ${newApt.doctorName}.`);
    return newApt;
  };

  const updateAppointmentStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    success('Appointment Status Changed', `Appointment ${id} status set to ${newStatus}.`);
  };

  const cancelAppointment = (id, reason = 'Patient cancellation') => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled', cancelReason: reason } : apt))
    );
    info('Appointment Cancelled', `Appointment ${id} has been marked as Cancelled.`);
  };

  // --- Admissions CRUD ---
  const addAdmission = (admData) => {
    const newId = `ADM-${Math.floor(300 + Math.random() * 700)}`;
    const newAdm = {
      ...admData,
      id: newId,
      admissionDate: admData.admissionDate || new Date().toISOString().split('T')[0],
      dischargeDate: null,
      status: admData.status || 'Admitted',
    };
    setAdmissions((prev) => [newAdm, ...prev]);
    // Also update patient status if found
    if (admData.patientId) {
      setPatients((prev) =>
        prev.map((p) => (p.id === admData.patientId ? { ...p, status: 'Inpatient' } : p))
      );
    }
    success('Patient Admitted', `${newAdm.patientName} assigned to ${newAdm.bedNumber} (${newAdm.ward}).`);
    return newAdm;
  };

  const dischargeAdmission = (id, dischargeDate, notes) => {
    setAdmissions((prev) =>
      prev.map((adm) => {
        if (adm.id === id) {
          if (adm.patientId) {
            setPatients((pPrev) =>
              pPrev.map((p) => (p.id === adm.patientId ? { ...p, status: 'Discharged' } : p))
            );
          }
          return {
            ...adm,
            status: 'Discharged',
            dischargeDate: dischargeDate || new Date().toISOString().split('T')[0],
            dischargeNotes: notes || 'Discharged in stable condition.',
          };
        }
        return adm;
      })
    );
    success('Discharge Completed', `Admission ${id} marked as discharged.`);
  };

  // --- Billing CRUD ---
  const addInvoice = (invoiceData) => {
    const newId = `INV-${Math.floor(4000 + Math.random() * 6000)}`;
    const invoiceNum = `MCP-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv = {
      ...invoiceData,
      id: newId,
      invoiceNumber: invoiceNum,
      date: invoiceData.date || new Date().toISOString().split('T')[0],
      status: invoiceData.status || 'Pending',
      paidAmount: Number(invoiceData.paidAmount) || 0,
      totalAmount: Number(invoiceData.totalAmount) || 0,
    };
    setInvoices((prev) => [newInv, ...prev]);
    success('Invoice Generated', `${invoiceNum} created for ${newInv.patientName}.`);
    return newInv;
  };

  const recordInvoicePayment = (id, paymentAmount, paymentMethod = 'Cash') => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const newPaid = (Number(inv.paidAmount) || 0) + Number(paymentAmount);
          const isFull = newPaid >= inv.totalAmount;
          return {
            ...inv,
            paidAmount: newPaid,
            status: isFull ? 'Paid' : 'Partially Paid',
            paymentMethod: paymentMethod,
            lastPaymentDate: new Date().toISOString().split('T')[0],
          };
        }
        return inv;
      })
    );
    success('Payment Recorded', `Payment recorded for invoice ${id}.`);
  };

  // --- Pharmacy & Inventory CRUD ---
  const addMedicine = (medData) => {
    const newId = `MED-${Math.floor(100 + Math.random() * 900)}`;
    const newMed = {
      ...medData,
      id: newId,
      quantity: Number(medData.quantity) || 0,
      minThreshold: Number(medData.minThreshold) || 100,
      unitPrice: Number(medData.unitPrice) || 0,
    };
    setMedicines((prev) => [newMed, ...prev]);
    success('Medicine Added', `${newMed.name} added to pharmacy catalog.`);
    return newMed;
  };

  const updateMedicine = (id, updatedData) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updatedData } : med))
    );
    success('Inventory Updated', `${updatedData.name || id} stock details updated.`);
  };

  const adjustStock = (id, amount, _reason = 'Inventory adjustment') => {
    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const newQty = Math.max(0, med.quantity + amount);
          return { ...med, quantity: newQty };
        }
        return med;
      })
    );
    info('Stock Adjusted', `Stock quantity modified for item ${id}.`);
  };

  const deleteMedicine = (id) => {
    const target = medicines.find((m) => m.id === id);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    info('Medicine Removed', `${target?.name || id} removed from pharmacy catalog.`);
  };

  // --- Staff CRUD ---
  const addStaff = (staffData) => {
    const newId = `STF-${Math.floor(500 + Math.random() * 500)}`;
    const newStf = {
      ...staffData,
      id: newId,
      joinedDate: staffData.joinedDate || new Date().toISOString().split('T')[0],
      status: staffData.status || 'Active',
    };
    setStaff((prev) => [newStf, ...prev]);
    success('Staff Registered', `${newStf.name} joined as ${newStf.role}.`);
    return newStf;
  };

  const updateStaff = (id, updatedData) => {
    setStaff((prev) =>
      prev.map((stf) => (stf.id === id ? { ...stf, ...updatedData } : stf))
    );
    success('Staff Updated', `${updatedData.name || id} details updated.`);
  };

  const deleteStaff = (id) => {
    const target = staff.find((s) => s.id === id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
    info('Staff Removed', `${target?.name || id} removed from staff roster.`);
  };

  // --- Profile & Settings ---
  const updateHospitalProfile = (newProfile) => {
    setHospitalProfile(newProfile);
    success('Settings Saved', 'Hospital institutional profile updated.');
  };

  const updateAppSettings = (newSettings) => {
    setAppSettings(newSettings);
    success('Preferences Saved', 'Application preferences saved.');
  };

  // Live computed dashboard KPIs
  const dashboardStats = useMemo(() => {
    const todayStr = '2026-10-14'; // Matching mock date
    const todayApts = appointments.filter((a) => a.date === todayStr);
    const activeAdmissionsCount = admissions.filter((a) => a.status !== 'Discharged').length;
    const lowStockCount = medicines.filter((m) => m.quantity <= m.minThreshold).length;
    const totalBeds = departments.reduce((acc, d) => acc + (d.bedCount || 0), 0);
    const occupiedBeds = activeAdmissionsCount;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      todayAppointments: todayApts.length,
      activeAdmissions: activeAdmissionsCount,
      totalDepartments: departments.length,
      totalStaff: staff.length,
      lowStockCount,
      totalBeds,
      occupiedBeds,
      occupancyRate,
    };
  }, [patients, doctors, appointments, admissions, departments, staff, medicines]);

  return (
    <HospitalDataContext.Provider
      value={{
        patients,
        doctors,
        departments,
        appointments,
        admissions,
        invoices,
        medicines,
        staff,
        hospitalProfile,
        appSettings,
        dashboardStats,
        // Methods
        addPatient,
        updatePatient,
        deletePatient,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addDepartment,
        updateDepartment,
        addAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        addAdmission,
        dischargeAdmission,
        addInvoice,
        recordInvoicePayment,
        addMedicine,
        updateMedicine,
        adjustStock,
        deleteMedicine,
        addStaff,
        updateStaff,
        deleteStaff,
        updateHospitalProfile,
        updateAppSettings,
      }}
    >
      {children}
    </HospitalDataContext.Provider>
  );
};

export const useHospitalData = () => {
  const context = useContext(HospitalDataContext);
  if (!context) {
    throw new Error('useHospitalData must be used within a HospitalDataProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
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
import { useAuth } from './AuthContext';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { departmentService } from '../services/departmentService';
import { appointmentService } from '../services/appointmentService';
import { admissionService } from '../services/admissionService';
import { billingService } from '../services/billingService';
import { pharmacyService } from '../services/pharmacyService';
import { staffService } from '../services/staffService';
import { themeService } from '../services/themeService';

const HospitalDataContext = createContext(null);

export const HospitalDataProvider = ({ children }) => {
  const { success, error, info } = useToast();
  const { isAuthenticated, token } = useAuth();

  const [patients, setPatients] = useState(initialPatients);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [departments, setDepartments] = useState(initialDepartments);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [admissions, setAdmissions] = useState(initialAdmissions);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [medicines, setMedicines] = useState(initialMedicines);
  const [staff, setStaff] = useState(initialStaff);
  const [hospitalProfile, setHospitalProfile] = useState(initialHospitalProfile);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState(null);

  const [appSettings, setAppSettings] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('medicare_global_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return { ...initialAppSettings, themeMode: savedTheme };
      }
    } catch {
      // fallback
    }
    return initialAppSettings;
  });

  // Global theme synchronization across entire hospital system
  useEffect(() => {
    const isDark = appSettings.themeMode === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try {
      localStorage.setItem('medicare_global_theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [appSettings.themeMode]);

  // Fetch all hospital data from PostgreSQL via backend APIs
  const fetchHospitalData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError(null);

    try {
      const results = await Promise.allSettled([
        patientService.getAll(),
        doctorService.getAll(),
        departmentService.getAll(),
        appointmentService.getAll(),
        admissionService.getAll(),
        billingService.getAll(),
        pharmacyService.getAll(),
        staffService.getAll(),
        themeService.getHospitalProfile(),
        themeService.getGlobalTheme(),
      ]);

      const [
        patientsRes,
        doctorsRes,
        departmentsRes,
        appointmentsRes,
        admissionsRes,
        billingRes,
        pharmacyRes,
        staffRes,
        profileRes,
        themeRes,
      ] = results;

      if (patientsRes.status === 'fulfilled' && Array.isArray(patientsRes.value?.data)) {
        setPatients(patientsRes.value.data);
      }
      if (doctorsRes.status === 'fulfilled' && Array.isArray(doctorsRes.value?.data)) {
        const normalizedDocs = doctorsRes.value.data.map((d) => ({
          ...d,
          specialty: d.specialization || d.specialty || '',
          consultationFee: d.consultationFeeLKR ?? d.consultationFee ?? 3500,
          roomNumber: d.consultationRoom || d.roomNumber || 'OPD-101',
          availability: d.status || d.availability || 'Available',
        }));
        setDoctors(normalizedDocs);
      }
      if (departmentsRes.status === 'fulfilled' && Array.isArray(departmentsRes.value?.data)) {
        setDepartments(departmentsRes.value.data);
      }
      if (appointmentsRes.status === 'fulfilled' && Array.isArray(appointmentsRes.value?.data)) {
        setAppointments(appointmentsRes.value.data);
      }
      if (admissionsRes.status === 'fulfilled' && Array.isArray(admissionsRes.value?.data)) {
        setAdmissions(admissionsRes.value.data);
      }
      if (billingRes.status === 'fulfilled' && Array.isArray(billingRes.value?.data)) {
        const normalizedInvs = billingRes.value.data.map((inv) => ({
          ...inv,
          totalAmount: inv.totalLKR ?? inv.totalAmount ?? 0,
          paidAmount: inv.amountPaid ?? inv.paidAmount ?? 0,
          subtotal: inv.subtotalLKR ?? inv.subtotal ?? 0,
          tax: inv.taxLKR ?? inv.tax ?? 0,
          patientName: inv.patientName || inv.patient?.name || 'Patient',
        }));
        setInvoices(normalizedInvs);
      }
      if (pharmacyRes.status === 'fulfilled' && Array.isArray(pharmacyRes.value?.data)) {
        const normalizedMeds = pharmacyRes.value.data.map((m) => ({
          ...m,
          quantity: m.stockQuantity ?? m.quantity ?? 0,
          minThreshold: m.reorderLevel ?? m.minThreshold ?? 50,
          unitPrice: m.unitPriceLKR ?? m.unitPrice ?? 0,
          form: m.dosageForm ?? m.form ?? 'Tablet',
        }));
        setMedicines(normalizedMeds);
      }
      if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value?.data)) {
        setStaff(staffRes.value.data);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        setHospitalProfile((prev) => ({ ...prev, ...profileRes.value.data }));
      }
      if (themeRes.status === 'fulfilled' && themeRes.value?.data?.themeMode) {
        const mode = themeRes.value.data.themeMode;
        setAppSettings((prev) => ({ ...prev, themeMode: mode }));
      }
    } catch (err) {
      console.error('Failed to synchronize hospital data from backend:', err);
      setDataError(err.message || 'Could not fetch records.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Synchronize when authenticated session changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchHospitalData();
    }
  }, [isAuthenticated, token, fetchHospitalData]);

  // --- Patients CRUD ---
  const addPatient = async (patientData) => {
    const tempId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const optimisticPatient = {
      ...patientData,
      id: patientData.id || tempId,
      registeredDate: patientData.registeredDate || new Date().toISOString().split('T')[0],
      status: patientData.status || 'Outpatient',
    };
    setPatients((prev) => [optimisticPatient, ...prev]);

    try {
      const res = await patientService.create(optimisticPatient);
      const saved = res.data || optimisticPatient;
      setPatients((prev) =>
        prev.map((p) => (p.id === optimisticPatient.id ? saved : p))
      );
      success('Patient Registered', `${saved.name} has been enrolled as ${saved.id}.`);
      return saved;
    } catch (err) {
      setPatients((prev) => prev.filter((p) => p.id !== optimisticPatient.id));
      error('Registration Failed', err.message || 'Could not register patient.');
      throw err;
    }
  };

  const updatePatient = async (id, updatedData) => {
    const previous = patients;
    setPatients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );

    try {
      const res = await patientService.update(id, updatedData);
      const saved = res.data;
      if (saved) {
        setPatients((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...saved } : item))
        );
      }
      success('Patient Updated', `Record for ${updatedData.name || id} was updated.`);
    } catch (err) {
      setPatients(previous);
      error('Update Failed', err.message || 'Could not update patient.');
      throw err;
    }
  };

  const deletePatient = async (id) => {
    const target = patients.find((p) => p.id === id);
    const previous = patients;
    setPatients((prev) => prev.filter((item) => item.id !== id));

    try {
      await patientService.delete(id);
      info('Patient Removed', `Record for ${target?.name || id} was deleted from active registry.`);
    } catch (err) {
      setPatients(previous);
      error('Deletion Failed', err.message || 'Could not archive patient.');
      throw err;
    }
  };

  // --- Doctors CRUD ---
  const addDoctor = async (doctorData) => {
    const tempId = `DOC-${Math.floor(200 + Math.random() * 800)}`;
    const optimisticDoc = {
      ...doctorData,
      id: doctorData.id || tempId,
      totalPatients: 0,
      status: doctorData.status || 'Available',
      specialty: doctorData.specialty || doctorData.specialization || '',
      consultationFee: Number(doctorData.consultationFee || doctorData.consultationFeeLKR || 3500),
      roomNumber: doctorData.roomNumber || doctorData.consultationRoom || 'OPD-101',
    };
    setDoctors((prev) => [optimisticDoc, ...prev]);

    try {
      const res = await doctorService.create(optimisticDoc);
      const saved = res.data || optimisticDoc;
      const normalized = {
        ...saved,
        specialty: saved.specialization || saved.specialty || '',
        consultationFee: saved.consultationFeeLKR ?? saved.consultationFee ?? 3500,
        roomNumber: saved.consultationRoom || saved.roomNumber || 'OPD-101',
      };
      setDoctors((prev) => prev.map((d) => (d.id === optimisticDoc.id ? normalized : d)));
      success('Doctor Registered', `${normalized.name} added to ${normalized.department}.`);
      return normalized;
    } catch (err) {
      setDoctors((prev) => prev.filter((d) => d.id !== optimisticDoc.id));
      error('Registration Failed', err.message || 'Could not register doctor.');
      throw err;
    }
  };

  const updateDoctor = async (id, updatedData) => {
    const previous = doctors;
    setDoctors((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updatedData } : doc))
    );

    try {
      const res = await doctorService.update(id, updatedData);
      const saved = res.data;
      if (saved) {
        setDoctors((prev) =>
          prev.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  ...saved,
                  specialty: saved.specialization || saved.specialty || doc.specialty,
                  consultationFee: saved.consultationFeeLKR ?? saved.consultationFee ?? doc.consultationFee,
                  roomNumber: saved.consultationRoom || saved.roomNumber || doc.roomNumber,
                }
              : doc
          )
        );
      }
      success('Doctor Updated', `Profile for ${updatedData.name || id} has been updated.`);
    } catch (err) {
      setDoctors(previous);
      error('Update Failed', err.message || 'Could not update doctor.');
      throw err;
    }
  };

  const deleteDoctor = async (id) => {
    const target = doctors.find((d) => d.id === id);
    const previous = doctors;
    setDoctors((prev) => prev.filter((d) => d.id !== id));

    try {
      await doctorService.delete(id);
      info('Doctor Removed', `${target?.name || id} removed from active roster.`);
    } catch (err) {
      setDoctors(previous);
      error('Deletion Failed', err.message || 'Could not remove doctor.');
      throw err;
    }
  };

  // --- Departments CRUD ---
  const addDepartment = async (deptData) => {
    const tempId = `DEP-${Math.floor(100 + Math.random() * 900)}`;
    const optimisticDept = {
      ...deptData,
      id: deptData.id || tempId,
      doctorCount: Number(deptData.doctorCount) || 0,
      bedCount: Number(deptData.bedCount) || 0,
      status: deptData.status || 'Active',
    };
    setDepartments((prev) => [...prev, optimisticDept]);

    try {
      const res = await departmentService.create(optimisticDept);
      const saved = res.data || optimisticDept;
      setDepartments((prev) =>
        prev.map((d) => (d.id === optimisticDept.id ? saved : d))
      );
      success('Department Created', `${saved.name} department created.`);
      return saved;
    } catch (err) {
      setDepartments((prev) => prev.filter((d) => d.id !== optimisticDept.id));
      error('Creation Failed', err.message || 'Could not create department.');
      throw err;
    }
  };

  const updateDepartment = async (id, updatedData) => {
    const previous = departments;
    setDepartments((prev) =>
      prev.map((dept) => (dept.id === id ? { ...dept, ...updatedData } : dept))
    );

    try {
      const res = await departmentService.update(id, updatedData);
      if (res.data) {
        setDepartments((prev) =>
          prev.map((dept) => (dept.id === id ? { ...dept, ...res.data } : dept))
        );
      }
      success('Department Updated', `${updatedData.name || id} details updated.`);
    } catch (err) {
      setDepartments(previous);
      error('Update Failed', err.message || 'Could not update department.');
      throw err;
    }
  };

  const deleteDepartment = async (id) => {
    const target = departments.find((d) => d.id === id);
    const previous = departments;
    setDepartments((prev) => prev.filter((d) => d.id !== id));

    try {
      await departmentService.delete(id);
      info('Department Removed', `${target?.name || id} deleted.`);
    } catch (err) {
      setDepartments(previous);
      error('Deletion Failed', err.message || 'Could not delete department.');
      throw err;
    }
  };

  // --- Appointments CRUD ---
  const addAppointment = async (appointmentData) => {
    const tempId = `APT-${Math.floor(500 + Math.random() * 500)}`;
    const optimisticApt = {
      ...appointmentData,
      id: appointmentData.id || tempId,
      status: appointmentData.status || 'Confirmed',
    };
    setAppointments((prev) => [optimisticApt, ...prev]);

    try {
      const res = await appointmentService.create(optimisticApt);
      const saved = res.data || optimisticApt;
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === optimisticApt.id ? saved : apt))
      );
      success('Appointment Scheduled', `Booking confirmed for ${saved.patientName} with ${saved.doctorName}.`);
      return saved;
    } catch (err) {
      setAppointments((prev) => prev.filter((a) => a.id !== optimisticApt.id));
      error('Booking Failed', err.message || 'Could not schedule appointment.');
      throw err;
    }
  };

  const updateAppointmentStatus = async (id, newStatus) => {
    const previous = appointments;
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );

    try {
      await appointmentService.updateStatus(id, newStatus);
      success('Appointment Status Changed', `Appointment ${id} status set to ${newStatus}.`);
    } catch (err) {
      setAppointments(previous);
      error('Status Update Failed', err.message || 'Could not update appointment status.');
      throw err;
    }
  };

  const cancelAppointment = async (id, reason = 'Patient cancellation') => {
    const previous = appointments;
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled', cancelReason: reason } : apt))
    );

    try {
      await appointmentService.cancel(id, reason);
      info('Appointment Cancelled', `Appointment ${id} has been marked as Cancelled.`);
    } catch (err) {
      setAppointments(previous);
      error('Cancellation Failed', err.message || 'Could not cancel appointment.');
      throw err;
    }
  };

  const deleteAppointment = async (id) => {
    const previous = appointments;
    setAppointments((prev) => prev.filter((a) => a.id !== id));

    try {
      await appointmentService.delete(id);
      info('Appointment Deleted', `Appointment ${id} removed.`);
    } catch (err) {
      setAppointments(previous);
      error('Deletion Failed', err.message || 'Could not delete appointment.');
      throw err;
    }
  };

  // --- Admissions CRUD ---
  const addAdmission = async (admData) => {
    const tempId = `ADM-${Math.floor(300 + Math.random() * 700)}`;
    const optimisticAdm = {
      ...admData,
      id: admData.id || tempId,
      admissionDate: admData.admissionDate || new Date().toISOString().split('T')[0],
      dischargeDate: null,
      status: admData.status || 'Admitted',
    };
    setAdmissions((prev) => [optimisticAdm, ...prev]);

    if (admData.patientId) {
      setPatients((prev) =>
        prev.map((p) => (p.id === admData.patientId ? { ...p, status: 'Inpatient' } : p))
      );
    }

    try {
      const res = await admissionService.create(optimisticAdm);
      const saved = res.data || optimisticAdm;
      setAdmissions((prev) =>
        prev.map((a) => (a.id === optimisticAdm.id ? saved : a))
      );
      success('Patient Admitted', `${saved.patientName} assigned to ${saved.bedNumber} (${saved.ward}).`);
      return saved;
    } catch (err) {
      setAdmissions((prev) => prev.filter((a) => a.id !== optimisticAdm.id));
      error('Admission Failed', err.message || 'Could not record admission.');
      throw err;
    }
  };

  const dischargeAdmission = async (id, dischargeDate, notes) => {
    const previous = admissions;
    const previousPatients = patients;

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

    try {
      await admissionService.discharge(id, dischargeDate, notes);
      success('Discharge Completed', `Admission ${id} marked as discharged.`);
    } catch (err) {
      setAdmissions(previous);
      setPatients(previousPatients);
      error('Discharge Failed', err.message || 'Could not complete discharge.');
      throw err;
    }
  };

  const deleteAdmission = async (id) => {
    const previous = admissions;
    setAdmissions((prev) => prev.filter((a) => a.id !== id));

    try {
      await admissionService.delete(id);
      info('Admission Deleted', `Admission ${id} deleted.`);
    } catch (err) {
      setAdmissions(previous);
      error('Deletion Failed', err.message || 'Could not delete admission.');
      throw err;
    }
  };

  // --- Billing CRUD ---
  const addInvoice = async (invoiceData) => {
    const tempId = `INV-${Math.floor(4000 + Math.random() * 6000)}`;
    const invoiceNum = `MCP-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = Number(invoiceData.totalAmount) || 0;
    const paid = Number(invoiceData.paidAmount) || 0;

    const optimisticInv = {
      ...invoiceData,
      id: invoiceData.id || tempId,
      invoiceNumber: invoiceData.invoiceNumber || invoiceNum,
      date: invoiceData.date || new Date().toISOString().split('T')[0],
      status: invoiceData.status || (paid >= total && total > 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending'),
      paidAmount: paid,
      totalAmount: total,
    };
    setInvoices((prev) => [optimisticInv, ...prev]);

    try {
      const res = await billingService.create(optimisticInv);
      const saved = res.data || optimisticInv;
      const normalized = {
        ...saved,
        totalAmount: saved.totalLKR ?? saved.totalAmount ?? total,
        paidAmount: saved.amountPaid ?? saved.paidAmount ?? paid,
        subtotal: saved.subtotalLKR ?? saved.subtotal ?? total,
        tax: saved.taxLKR ?? saved.tax ?? 0,
        patientName: saved.patientName || optimisticInv.patientName,
      };
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === optimisticInv.id ? normalized : inv))
      );
      success('Invoice Generated', `${normalized.invoiceNumber} created for ${normalized.patientName}.`);
      return normalized;
    } catch (err) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== optimisticInv.id));
      error('Invoice Failed', err.message || 'Could not generate invoice.');
      throw err;
    }
  };

  const recordInvoicePayment = async (id, paymentAmount, paymentMethod = 'Cash') => {
    const previous = invoices;
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const newPaid = (Number(inv.paidAmount) || 0) + Number(paymentAmount);
          const isFull = newPaid >= inv.totalAmount;
          return {
            ...inv,
            paidAmount: newPaid,
            amountPaid: newPaid,
            status: isFull ? 'Paid' : 'Partially Paid',
            paymentMethod: paymentMethod,
            lastPaymentDate: new Date().toISOString().split('T')[0],
          };
        }
        return inv;
      })
    );

    try {
      const res = await billingService.recordPayment(id, {
        amountPaid: paymentAmount,
        paymentMethod,
      });
      const saved = res.data;
      if (saved) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === id
              ? {
                  ...inv,
                  ...saved,
                  totalAmount: saved.totalLKR ?? saved.totalAmount ?? inv.totalAmount,
                  paidAmount: saved.amountPaid ?? saved.paidAmount ?? inv.paidAmount,
                }
              : inv
          )
        );
      }
      success('Payment Recorded', `Payment recorded for invoice ${id}.`);
    } catch (err) {
      setInvoices(previous);
      error('Payment Failed', err.message || 'Could not record payment.');
      throw err;
    }
  };

  const deleteInvoice = async (id) => {
    const previous = invoices;
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));

    try {
      await billingService.delete(id);
      info('Invoice Deleted', `Invoice ${id} deleted.`);
    } catch (err) {
      setInvoices(previous);
      error('Deletion Failed', err.message || 'Could not delete invoice.');
      throw err;
    }
  };

  // --- Pharmacy & Inventory CRUD ---
  const addMedicine = async (medData) => {
    const tempId = `MED-${Math.floor(100 + Math.random() * 900)}`;
    const optimisticMed = {
      ...medData,
      id: medData.id || tempId,
      quantity: Number(medData.quantity) || 0,
      minThreshold: Number(medData.minThreshold) || 100,
      unitPrice: Number(medData.unitPrice) || 0,
      dosageForm: medData.dosageForm || medData.form || 'Tablet',
      form: medData.form || medData.dosageForm || 'Tablet',
    };
    setMedicines((prev) => [optimisticMed, ...prev]);

    try {
      const res = await pharmacyService.create(optimisticMed);
      const saved = res.data || optimisticMed;
      const normalized = {
        ...saved,
        quantity: saved.stockQuantity ?? saved.quantity,
        minThreshold: saved.reorderLevel ?? saved.minThreshold,
        unitPrice: saved.unitPriceLKR ?? saved.unitPrice,
        form: saved.dosageForm ?? saved.form,
      };
      setMedicines((prev) =>
        prev.map((m) => (m.id === optimisticMed.id ? normalized : m))
      );
      success('Medicine Added', `${normalized.name} added to pharmacy catalog.`);
      return normalized;
    } catch (err) {
      setMedicines((prev) => prev.filter((m) => m.id !== optimisticMed.id));
      error('Add Medicine Failed', err.message || 'Could not add medicine.');
      throw err;
    }
  };

  const updateMedicine = async (id, updatedData) => {
    const previous = medicines;
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updatedData } : med))
    );

    try {
      const res = await pharmacyService.update(id, updatedData);
      const saved = res.data;
      if (saved) {
        setMedicines((prev) =>
          prev.map((med) =>
            med.id === id
              ? {
                  ...med,
                  ...saved,
                  quantity: saved.stockQuantity ?? saved.quantity ?? med.quantity,
                  minThreshold: saved.reorderLevel ?? saved.minThreshold ?? med.minThreshold,
                  unitPrice: saved.unitPriceLKR ?? saved.unitPrice ?? med.unitPrice,
                  form: saved.dosageForm ?? saved.form ?? med.form,
                }
              : med
          )
        );
      }
      success('Inventory Updated', `${updatedData.name || id} stock details updated.`);
    } catch (err) {
      setMedicines(previous);
      error('Update Failed', err.message || 'Could not update inventory item.');
      throw err;
    }
  };

  const adjustStock = async (id, amount, _reason = 'Inventory adjustment') => {
    const previous = medicines;
    let target = null;
    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const newQty = Math.max(0, (med.quantity || 0) + amount);
          target = { ...med, quantity: newQty };
          return target;
        }
        return med;
      })
    );

    try {
      await pharmacyService.adjustStock(id, { adjustment: amount });
      info('Stock Adjusted', `Stock quantity modified for item ${id}.`);
    } catch (err) {
      setMedicines(previous);
      error('Adjustment Failed', err.message || 'Could not adjust stock level.');
      throw err;
    }
  };

  const deleteMedicine = async (id) => {
    const target = medicines.find((m) => m.id === id);
    const previous = medicines;
    setMedicines((prev) => prev.filter((m) => m.id !== id));

    try {
      await pharmacyService.delete(id);
      info('Medicine Removed', `${target?.name || id} removed from pharmacy catalog.`);
    } catch (err) {
      setMedicines(previous);
      error('Deletion Failed', err.message || 'Could not delete medicine.');
      throw err;
    }
  };

  // --- Staff CRUD ---
  const addStaff = async (staffData) => {
    const tempId = `STF-${Math.floor(500 + Math.random() * 500)}`;
    const optimisticStaff = {
      ...staffData,
      id: staffData.id || tempId,
      joinedDate: staffData.joinedDate || new Date().toISOString().split('T')[0],
      status: staffData.status || 'Active',
    };
    setStaff((prev) => [optimisticStaff, ...prev]);

    try {
      const res = await staffService.create(optimisticStaff);
      const saved = res.data || optimisticStaff;
      setStaff((prev) =>
        prev.map((s) => (s.id === optimisticStaff.id ? saved : s))
      );
      success('Staff Registered', `${saved.name} joined as ${saved.role}.`);
      return saved;
    } catch (err) {
      setStaff((prev) => prev.filter((s) => s.id !== optimisticStaff.id));
      error('Registration Failed', err.message || 'Could not register staff member.');
      throw err;
    }
  };

  const updateStaff = async (id, updatedData) => {
    const previous = staff;
    setStaff((prev) =>
      prev.map((stf) => (stf.id === id ? { ...stf, ...updatedData } : stf))
    );

    try {
      const res = await staffService.update(id, updatedData);
      if (res.data) {
        setStaff((prev) =>
          prev.map((stf) => (stf.id === id ? { ...stf, ...res.data } : stf))
        );
      }
      success('Staff Updated', `${updatedData.name || id} details updated.`);
    } catch (err) {
      setStaff(previous);
      error('Update Failed', err.message || 'Could not update staff member.');
      throw err;
    }
  };

  const deleteStaff = async (id) => {
    const target = staff.find((s) => s.id === id);
    const previous = staff;
    setStaff((prev) => prev.filter((s) => s.id !== id));

    try {
      await staffService.delete(id);
      info('Staff Removed', `${target?.name || id} removed from staff roster.`);
    } catch (err) {
      setStaff(previous);
      error('Deletion Failed', err.message || 'Could not remove staff member.');
      throw err;
    }
  };

  // --- Profile & Settings ---
  const updateHospitalProfile = async (newProfile) => {
    setHospitalProfile(newProfile);
    try {
      await themeService.updateHospitalProfile(newProfile);
      success('Settings Saved', 'Hospital institutional profile updated in PostgreSQL.');
    } catch (err) {
      console.warn('Hospital profile database sync warning:', err);
      success('Settings Saved', 'Hospital institutional profile updated locally.');
    }
  };

  const updateAppSettings = (newSettings, customToast) => {
    setAppSettings(newSettings);
    if (customToast) {
      success(customToast.title, customToast.message);
    } else {
      success('Preferences Saved', 'Application preferences saved.');
    }
  };

  const setGlobalThemeMode = async (mode) => {
    setAppSettings((prev) => ({ ...prev, themeMode: mode }));
    try {
      await themeService.updateGlobalTheme(mode);
    } catch (err) {
      console.warn('Theme backend sync warning:', err);
    }
    success(
      'Hospital Theme Updated',
      `Hospital-wide theme switched to ${mode === 'dark' ? 'Clinical Dark' : 'Professional Light'} Mode.`
    );
  };

  const toggleGlobalTheme = () => {
    const nextMode = appSettings.themeMode === 'dark' ? 'light' : 'dark';
    setGlobalThemeMode(nextMode);
  };

  // Live computed dashboard KPIs combining live database entities
  const [currentDateStr] = useState(() => new Date().toISOString().slice(0, 10));

  const dashboardStats = useMemo(() => {
    const todayApts = appointments.filter((a) => a.date === currentDateStr);
    const activeAdmissionsCount = admissions.filter((a) => a.status === 'Admitted' || a.status === 'Under Observation').length;
    const lowStockCount = medicines.filter(
      (m) => (m.quantity || m.stockQuantity || 0) <= (m.minThreshold || m.reorderLevel || 50)
    ).length;
    const totalBeds = departments.reduce((acc, d) => acc + (d.bedCount || 0), 0) || hospitalProfile.operatingBeds || 180;
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
  }, [patients, doctors, appointments, admissions, departments, staff, medicines, hospitalProfile, currentDateStr]);

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
        isLoadingData,
        dataError,
        fetchHospitalData,
        // Methods
        addPatient,
        updatePatient,
        deletePatient,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        deleteAppointment,
        addAdmission,
        dischargeAdmission,
        deleteAdmission,
        addInvoice,
        recordInvoicePayment,
        deleteInvoice,
        addMedicine,
        updateMedicine,
        adjustStock,
        deleteMedicine,
        addStaff,
        updateStaff,
        deleteStaff,
        updateHospitalProfile,
        updateAppSettings,
        setGlobalThemeMode,
        toggleGlobalTheme,
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

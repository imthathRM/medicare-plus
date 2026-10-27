import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { DataTable } from '../components/common/DataTable';
import { SearchInput } from '../components/common/SearchInput';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField, Input, Select, Textarea } from '../components/common/FormField';
import { formatDate, calculateAge } from '../utils/formatters';
import { validateRequired, validateEmail, validatePhone } from '../utils/validators';

export const Patients = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { patients, departments, addPatient, updatePatient, deletePatient } = useHospitalData();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(() => searchParams.get('action') === 'new');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState(() => ({
    name: '',
    gender: 'Male',
    dob: '1990-01-01',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    nationalId: '',
    address: '',
    emergencyContact: '',
    status: 'Outpatient',
    department: departments[0]?.name || 'General Surgery',
    allergies: '',
    medicalHistory: '',
  }));

  const [formErrors, setFormErrors] = useState({});

  const handleOpenAddModal = useCallback(() => {
    setFormData({
      name: '',
      gender: 'Male',
      dob: '1990-01-01',
      bloodGroup: 'O+',
      phone: '',
      email: '',
      nationalId: '',
      address: '',
      emergencyContact: '',
      status: 'Outpatient',
      department: departments[0]?.name || 'General Surgery',
      allergies: '',
      medicalHistory: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  }, [departments]);

  // Check URL query param for quick action
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setSearchParams((prev) => {
        prev.delete('action');
        return prev;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        patient.name.toLowerCase().includes(q) ||
        patient.id.toLowerCase().includes(q) ||
        (patient.nationalId && patient.nationalId.toLowerCase().includes(q)) ||
        (patient.phone && patient.phone.includes(q));

      const matchesStatus = statusFilter === 'ALL' || patient.status === statusFilter;
      const matchesGender = genderFilter === 'ALL' || patient.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [patients, searchQuery, statusFilter, genderFilter]);

  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || '',
      gender: patient.gender || 'Male',
      dob: patient.dob || '',
      bloodGroup: patient.bloodGroup || 'O+',
      phone: patient.phone || '',
      email: patient.email || '',
      nationalId: patient.nationalId || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      status: patient.status || 'Outpatient',
      department: patient.department || departments[0]?.name || '',
      allergies: patient.allergies || '',
      medicalHistory: patient.medicalHistory || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenViewModal = (patient) => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (patient) => {
    setPatientToDelete(patient);
    setIsDeleteConfirmOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    const nameErr = validateRequired(formData.name, 'Full name');
    if (nameErr) errs.name = nameErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errs.phone = phoneErr;

    if (formData.email) {
      const emailErr = validateEmail(formData.email);
      if (emailErr) errs.email = emailErr;
    }

    const dobErr = validateRequired(formData.dob, 'Date of birth');
    if (dobErr) errs.dob = dobErr;

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const calculatedAge = calculateAge(formData.dob);
    addPatient({
      ...formData,
      age: calculatedAge || 30,
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const calculatedAge = calculateAge(formData.dob);
    updatePatient(selectedPatient.id, {
      ...formData,
      age: calculatedAge || selectedPatient.age,
    });
    setIsEditModalOpen(false);
  };

  const columns = [
    {
      header: 'Patient Info',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-slate-700 text-[#2563EB] dark:text-[#60A5FA] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-800 shrink-0">
            {row.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] truncate">{row.name}</p>
            <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#CBD5E1]">
              <span className="font-mono">{row.id}</span>
              <span>•</span>
              <span>{row.gender}</span>
              <span>•</span>
              <span>{row.age} yrs</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Blood Group',
      key: 'bloodGroup',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs bg-red-50 dark:bg-red-950/60 text-[#B91C1C] dark:text-[#F87171] border border-red-200/80 dark:border-red-900/40">
          {row.bloodGroup}
        </span>
      ),
    },
    {
      header: 'Contact Details',
      key: 'phone',
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium text-[#334155] dark:text-[#F1F5F9]">{row.phone}</p>
          <p className="text-[#64748B] dark:text-[#CBD5E1] text-[11px] truncate max-w-[150px]">{row.email || 'No email'}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      key: 'department',
      render: (row) => (
        <span className="text-xs font-medium text-[#334155] dark:text-[#CBD5E1] bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] px-2.5 py-1 rounded-lg">
          {row.department || 'General Care'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge status={row.status} size="sm" />,
    },
    {
      header: 'Registered',
      key: 'registeredDate',
      render: (row) => (
        <span className="text-xs text-[#64748B] dark:text-[#CBD5E1] whitespace-nowrap">
          {formatDate(row.registeredDate)}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right actions-column',
      cellClassName: 'text-right actions-column',
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenViewModal(row)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F766E] hover:bg-teal-50 transition-colors"
            title="Edit Record"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#B91C1C] hover:bg-red-50 transition-colors"
            title="Delete Patient"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">Patient Registry</h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-0.5">
            Manage electronic medical records, admission histories, and diagnostic profiles
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={UserPlus}
          onClick={handleOpenAddModal}
        >
          Register New Patient
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, ID, phone, or NIC..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#CBD5E1]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-2 text-[#334155] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20 focus:border-[#2563EB] dark:focus:border-[#60A5FA]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Inpatient">Inpatient</option>
            <option value="Outpatient">Outpatient</option>
            <option value="Under Observation">Under Observation</option>
            <option value="Discharged">Discharged</option>
          </select>

          {/* Gender filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-2 text-[#334155] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20 focus:border-[#2563EB] dark:focus:border-[#60A5FA]"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL' || genderFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setGenderFilter('ALL');
              }}
              className="text-xs text-[#2563EB] dark:text-[#60A5FA] hover:underline font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Patients Data Table */}
      <DataTable
        columns={columns}
        data={filteredPatients}
        pageSize={8}
        emptyTitle="No patients found"
        emptyMessage="Try adjusting your search terms or filter selection."
        onRowClick={handleOpenViewModal}
      />

      {/* Modal: View Patient Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Patient Clinical Dossier"
        description="Comprehensive demographic, clinical history, and admission details"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              leftIcon={Edit2}
              onClick={() => {
                setIsViewModalOpen(false);
                handleOpenEditModal(selectedPatient);
              }}
            >
              Edit Dossier
            </Button>
          </>
        }
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Header snippet */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-sky-50 dark:bg-slate-700/60 border border-sky-100 dark:border-slate-600">
              <div className="w-14 h-14 rounded-lg bg-sky-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {selectedPatient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-[#F1F5F9] truncate">
                    {selectedPatient.name}
                  </h4>
                  <Badge status={selectedPatient.status} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-600 dark:text-[#CBD5E1]">
                  <span>
                    MRN: <strong className="text-slate-800 dark:text-[#F1F5F9] font-mono">{selectedPatient.id}</strong>
                  </span>
                  <span>NIC: {selectedPatient.nationalId || 'N/A'}</span>
                  <span>
                    Age: {selectedPatient.age} yrs ({selectedPatient.gender})
                  </span>
                  <span className="font-bold text-rose-600 dark:text-[#F87171]">Blood: {selectedPatient.bloodGroup}</span>
                </div>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155] space-y-2">
                <p className="font-semibold text-slate-800 dark:text-[#F1F5F9] uppercase tracking-wider text-[11px]">
                  Contact & Residence
                </p>
                <div className="flex items-center gap-2 text-slate-700 dark:text-[#CBD5E1]">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-[#CBD5E1]">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedPatient.email || 'No email registered'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  <strong>Address:</strong> {selectedPatient.address || 'Colombo, Sri Lanka'}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  <strong>Emergency:</strong> {selectedPatient.emergencyContact || 'None recorded'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155] space-y-2">
                <p className="font-semibold text-slate-800 dark:text-[#F1F5F9] uppercase tracking-wider text-[11px]">
                  Clinical Assignment
                </p>
                <p className="text-slate-700 dark:text-[#CBD5E1]">
                  <strong>Department:</strong> {selectedPatient.department || 'General Medicine'}
                </p>
                <p className="text-slate-700 dark:text-[#CBD5E1]">
                  <strong>Attending Doctor:</strong>{' '}
                  {selectedPatient.attendingDoctor || 'Consultant On-Duty'}
                </p>
                <p className="text-slate-700 dark:text-[#CBD5E1]">
                  <strong>Enrolled On:</strong> {formatDate(selectedPatient.registeredDate)}
                </p>
                <p className="text-slate-700 dark:text-[#CBD5E1]">
                  <strong>Last Visit / Checkup:</strong>{' '}
                  {formatDate(selectedPatient.lastVisit || selectedPatient.registeredDate)}
                </p>
              </div>
            </div>

            {/* Allergies & Medical History */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-red-950/40 border border-rose-100 dark:border-red-900/40">
                <div className="flex items-center gap-2 text-rose-800 dark:text-[#F87171] font-semibold text-xs mb-1">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-[#F87171]" />
                  Known Allergies & Contraindications
                </div>
                <p className="text-xs text-rose-700 dark:text-red-300">
                  {selectedPatient.allergies || 'No known drug or food allergies on record.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155]">
                <p className="text-xs font-semibold text-slate-800 dark:text-[#F1F5F9] mb-1">
                  Medical History & Chronic Conditions
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPatient.medicalHistory || 'No prior chronic conditions recorded in primary record.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Add Patient */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Patient"
        description="Enroll a new patient into the hospital information management system."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Save & Enroll
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" required error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sunil Shantha Gunaratne"
                error={!!formErrors.name}
              />
            </FormField>

            <FormField label="National ID / NIC / Passport">
              <Input
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                placeholder="e.g. 197610603411"
              />
            </FormField>

            <FormField label="Date of Birth" required error={formErrors.dob}>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                error={!!formErrors.dob}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Gender">
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </FormField>

              <FormField label="Blood Group">
                <Select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
              </FormField>
            </div>

            <FormField label="Primary Phone" required error={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+94 77 123 4567"
                error={!!formErrors.phone}
              />
            </FormField>

            <FormField label="Email Address" error={formErrors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                error={!!formErrors.email}
              />
            </FormField>

            <FormField label="Initial Care Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Outpatient">Outpatient</option>
                <option value="Inpatient">Inpatient</option>
                <option value="Under Observation">Under Observation</option>
              </Select>
            </FormField>

            <FormField label="Primary Department">
              <Select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Emergency Contact (Name & Relationship & Phone)">
            <Input
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="e.g. Kamani Gunaratne (Wife) - +94 71 987 6543"
            />
          </FormField>

          <FormField label="Residential Address">
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 45/2 Temple Road, Colombo 03"
            />
          </FormField>

          <FormField label="Known Drug/Food Allergies">
            <Input
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="e.g. Penicillin, Sulfa, Latex (or None)"
            />
          </FormField>

          <FormField label="Medical History / Notes">
            <Textarea
              rows={2}
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              placeholder="Chronic conditions, prior surgeries, relevant clinical notes..."
            />
          </FormField>
        </form>
      </Modal>

      {/* Modal: Edit Patient */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Patient: ${selectedPatient?.name || ''}`}
        description="Update patient contact information and clinical classification."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Update Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" required error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
              />
            </FormField>

            <FormField label="National ID / NIC / Passport">
              <Input
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              />
            </FormField>

            <FormField label="Date of Birth" required error={formErrors.dob}>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                error={!!formErrors.dob}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Gender">
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </FormField>

              <FormField label="Blood Group">
                <Select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
              </FormField>
            </div>

            <FormField label="Primary Phone" required error={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={!!formErrors.phone}
              />
            </FormField>

            <FormField label="Email Address" error={formErrors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!formErrors.email}
              />
            </FormField>

            <FormField label="Care Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Outpatient">Outpatient</option>
                <option value="Inpatient">Inpatient</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Discharged">Discharged</option>
              </Select>
            </FormField>

            <FormField label="Primary Department">
              <Select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Emergency Contact">
            <Input
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            />
          </FormField>

          <FormField label="Address">
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </FormField>

          <FormField label="Known Drug/Food Allergies">
            <Input
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            />
          </FormField>

          <FormField label="Medical History">
            <Textarea
              rows={2}
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>

      {/* Confirmation Dialog: Delete Patient */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (patientToDelete) {
            deletePatient(patientToDelete.id);
          }
        }}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete the medical record for ${patientToDelete?.name} (${patientToDelete?.id})? This action will remove their profile from the active hospital registry.`}
        confirmText="Delete Record"
        confirmVariant="danger"
      />
    </div>
  );
};

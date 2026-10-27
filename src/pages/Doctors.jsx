import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Award,
  Grid,
  List,
  Filter,
  Inbox,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SearchInput } from '../components/common/SearchInput';
import { DataTable } from '../components/common/DataTable';
import { FormField, Input, Select } from '../components/common/FormField';
import { formatLKR } from '../utils/formatters';
import { validateRequired, validateEmail, validatePhone, validateNumber } from '../utils/validators';

export const Doctors = () => {
  const { doctors, departments, addDoctor, updateDoctor, deleteDoctor } = useHospitalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    department: 'Cardiology',
    specialty: '',
    qualification: '',
    experience: '',
    email: '',
    phone: '',
    availability: '',
    roomNumber: '',
    consultationFee: 4000,
    status: 'Available',
    gender: 'Male',
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q);

      const matchesDept = departmentFilter === 'ALL' || doc.department === departmentFilter;
      const matchesStatus = availabilityFilter === 'ALL' || doc.status === availabilityFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [doctors, searchQuery, departmentFilter, availabilityFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      title: 'Consultant Specialist',
      department: departments[0]?.name || 'Cardiology',
      specialty: '',
      qualification: 'MBBS, MD',
      experience: '10 years',
      email: '',
      phone: '',
      availability: 'Mon - Fri (09:00 AM - 01:00 PM)',
      roomNumber: 'Room 101, Building A',
      consultationFee: 4000,
      status: 'Available',
      gender: 'Male',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setSelectedDoctor(doc);
    setFormData({
      name: doc.name || '',
      title: doc.title || '',
      department: doc.department || '',
      specialty: doc.specialty || '',
      qualification: doc.qualification || '',
      experience: doc.experience || '',
      email: doc.email || '',
      phone: doc.phone || '',
      availability: doc.availability || '',
      roomNumber: doc.roomNumber || '',
      consultationFee: doc.consultationFee || 4000,
      status: doc.status || 'Available',
      gender: doc.gender || 'Male',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenView = (doc) => {
    setSelectedDoctor(doc);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (doc) => {
    setDoctorToDelete(doc);
    setIsDeleteConfirmOpen(true);
  };

  const validate = () => {
    const errs = {};
    const nameErr = validateRequired(formData.name, 'Doctor name');
    if (nameErr) errs.name = nameErr;

    const specErr = validateRequired(formData.specialty, 'Medical specialty');
    if (specErr) errs.specialty = specErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errs.email = emailErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errs.phone = phoneErr;

    const feeErr = validateNumber(formData.consultationFee, 'Consultation fee', 500);
    if (feeErr) errs.consultationFee = feeErr;

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addDoctor(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateDoctor(selectedDoctor.id, formData);
    setIsEditModalOpen(false);
  };

  const tableColumns = [
    {
      header: 'Doctor Profile',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shrink-0">
            {row.name
              .replace('Dr. ', '')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.title}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & Specialty',
      key: 'department',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 text-xs">{row.department}</span>
          <p className="text-[11px] text-slate-500">{row.specialty}</p>
        </div>
      ),
    },
    {
      header: 'Contact',
      key: 'contact',
      render: (row) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">{row.phone}</p>
          <p className="text-slate-400 text-[11px] truncate max-w-[150px]">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Consultation Fee',
      key: 'consultationFee',
      render: (row) => (
        <span className="font-semibold text-xs text-slate-900 dark:text-[#F1F5F9]">
          {formatLKR(row.consultationFee)}
        </span>
      ),
    },
    {
      header: 'Availability',
      key: 'status',
      render: (row) => <Badge status={row.status} size="sm" />,
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right actions-column',
      cellClassName: 'text-right actions-column',
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenView(row)}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#CBD5E1] hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#CBD5E1] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-teal-50 dark:hover:bg-teal-900/40 transition-colors"
            title="Edit Doctor"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#CBD5E1] hover:text-[#B91C1C] dark:hover:text-[#F87171] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete Doctor"
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
          <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">Doctor Directory</h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-0.5">
            Specialist consultants, clinical schedules, and department affiliations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 dark:bg-slate-700 text-[#2563EB] dark:text-[#60A5FA]'
                  : 'text-[#64748B] dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9]'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-50 dark:bg-slate-700 text-[#2563EB] dark:text-[#60A5FA]'
                  : 'text-[#64748B] dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button variant="primary" leftIcon={UserPlus} onClick={handleOpenAdd}>
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by doctor name, specialty, or department..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#CBD5E1]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-2 text-[#334155] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20 focus:border-[#2563EB] dark:focus:border-[#60A5FA]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-2 text-[#334155] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20 focus:border-[#2563EB] dark:focus:border-[#60A5FA]"
          >
            <option value="ALL">All Availabilities</option>
            <option value="Available">Available</option>
            <option value="On Duty">On Duty</option>
            <option value="In Surgery">In Surgery</option>
            <option value="On Leave">On Leave</option>
          </select>

          {(searchQuery || departmentFilter !== 'ALL' || availabilityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('ALL');
                setAvailabilityFilter('ALL');
              }}
              className="text-xs text-[#2563EB] dark:text-[#60A5FA] hover:underline font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content: Grid Cards or Data Table */}
      {viewMode === 'grid' ? (
        filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155] p-5 shadow-xs transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Header snippet */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-slate-700 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-800/40 shrink-0">
                        {doc.name
                          .replace('Dr. ', '')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1E3A5F] dark:text-[#F1F5F9] text-sm">{doc.name}</h3>
                        <p className="text-xs text-[#64748B] dark:text-[#CBD5E1]">{doc.title}</p>
                      </div>
                    </div>
                    <Badge status={doc.status} size="sm" />
                  </div>

                  <div className="space-y-2 text-xs text-[#334155] dark:text-[#CBD5E1] mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                      <span className="font-medium text-[#1E3A5F] dark:text-[#F1F5F9]">{doc.department}</span>
                      <span className="text-[#64748B] dark:text-slate-400">({doc.specialty})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
                      <span className="truncate">{doc.availability}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-400 shrink-0" />
                      <span>{doc.roomNumber}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                      <span className="text-[#64748B] dark:text-[#CBD5E1]">Consultation Fee</span>
                      <span className="font-bold text-[#1E3A5F] dark:text-[#F1F5F9] text-xs">
                        {formatLKR(doc.consultationFee)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-5 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono">{doc.id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenView(doc)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenDelete(doc)}
                      className="p-1 text-xs text-[#64748B] dark:text-[#CBD5E1] hover:text-[#B91C1C] dark:hover:text-[#F87171] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155] p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-[#F7F9FC] dark:bg-slate-800 text-[#64748B] dark:text-[#CBD5E1] flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155] mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">No doctors found</p>
            <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] max-w-sm mx-auto mt-1">
              No doctors matching your filters or search terms were found.
            </p>
          </div>
        )
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredDoctors}
          pageSize={8}
          emptyTitle="No doctors found"
          emptyMessage="No doctors matching your filters were found."
          onRowClick={handleOpenView}
        />
      )}

      {/* Modal: View Doctor Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Doctor Profile"
        description="Comprehensive clinical qualifications and consulting hours"
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedDoctor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-teal-50 dark:bg-slate-700/60 border border-teal-100 dark:border-slate-600">
              <div className="w-14 h-14 rounded-lg bg-teal-600 dark:bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {selectedDoctor.name
                  .replace('Dr. ', '')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-[#F1F5F9]">{selectedDoctor.name}</h4>
                  <Badge status={selectedDoctor.status} size="sm" />
                </div>
                <p className="text-xs text-slate-600 dark:text-[#CBD5E1] mt-0.5">{selectedDoctor.title}</p>
                <p className="text-xs font-semibold text-teal-700 dark:text-[#2DD4BF] mt-1">
                  {selectedDoctor.department} — {selectedDoctor.specialty}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155] space-y-2.5 text-xs">
              <p className="text-slate-700 dark:text-[#CBD5E1]">
                <strong>Qualifications:</strong> {selectedDoctor.qualification}
              </p>
              <p className="text-slate-700 dark:text-[#CBD5E1]">
                <strong>Clinical Experience:</strong> {selectedDoctor.experience}
              </p>
              <p className="text-slate-700 dark:text-[#CBD5E1]">
                <strong>Consulting Hours:</strong> {selectedDoctor.availability}
              </p>
              <p className="text-slate-700 dark:text-[#CBD5E1]">
                <strong>Clinic / Room:</strong> {selectedDoctor.roomNumber}
              </p>
              <p className="text-slate-700 dark:text-[#CBD5E1]">
                <strong>Standard Consultation Fee:</strong>{' '}
                <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">{formatLKR(selectedDoctor.consultationFee)}</span>
              </p>
              <p className="text-slate-700 dark:text-[#CBD5E1]">
                <strong>Direct Phone:</strong> {selectedDoctor.phone}
              </p>
              <p className="text-slate-700 dark:text-[#CBD5E1]">
                <strong>Institutional Email:</strong> {selectedDoctor.email}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Add Doctor */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Consultant / Doctor"
        description="Register a specialist doctor to hospital department rosters."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Save Doctor
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Doctor Full Name" required error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Priyantha Dissanayake"
                error={!!formErrors.name}
              />
            </FormField>

            <FormField label="Professional Title">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Consultant Cardiologist"
              />
            </FormField>

            <FormField label="Department">
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

            <FormField label="Specialty / Subspecialty" required error={formErrors.specialty}>
              <Input
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="e.g. Interventional Cardiology"
                error={!!formErrors.specialty}
              />
            </FormField>

            <FormField label="Qualifications">
              <Input
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. MBBS, MD, MRCP (UK)"
              />
            </FormField>

            <FormField label="Years of Experience">
              <Input
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 15 years"
              />
            </FormField>

            <FormField label="Consultation Fee (LKR)" required error={formErrors.consultationFee}>
              <Input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                error={!!formErrors.consultationFee}
              />
            </FormField>

            <FormField label="Current Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="On Duty">On Duty</option>
                <option value="In Surgery">In Surgery</option>
                <option value="On Leave">On Leave</option>
              </Select>
            </FormField>

            <FormField label="Phone Number" required error={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+94 77 123 4567"
                error={!!formErrors.phone}
              />
            </FormField>

            <FormField label="Official Email" required error={formErrors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@medicare.plus"
                error={!!formErrors.email}
              />
            </FormField>
          </div>

          <FormField label="Consultation Availability Schedule">
            <Input
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              placeholder="e.g. Mon, Wed, Fri (09:00 AM - 01:00 PM)"
            />
          </FormField>

          <FormField label="Room / Clinic Location">
            <Input
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g. Room 304, Building A"
            />
          </FormField>
        </form>
      </Modal>

      {/* Modal: Edit Doctor */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Doctor Profile: ${selectedDoctor?.name || ''}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Update Doctor
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Doctor Full Name" required error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
              />
            </FormField>

            <FormField label="Professional Title">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </FormField>

            <FormField label="Department">
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

            <FormField label="Specialty / Subspecialty" required error={formErrors.specialty}>
              <Input
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                error={!!formErrors.specialty}
              />
            </FormField>

            <FormField label="Consultation Fee (LKR)" required error={formErrors.consultationFee}>
              <Input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                error={!!formErrors.consultationFee}
              />
            </FormField>

            <FormField label="Current Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="On Duty">On Duty</option>
                <option value="In Surgery">In Surgery</option>
                <option value="On Leave">On Leave</option>
              </Select>
            </FormField>

            <FormField label="Phone Number" required error={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={!!formErrors.phone}
              />
            </FormField>

            <FormField label="Official Email" required error={formErrors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!formErrors.email}
              />
            </FormField>
          </div>

          <FormField label="Consultation Availability Schedule">
            <Input
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            />
          </FormField>

          <FormField label="Room / Clinic Location">
            <Input
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>

      {/* Confirmation Dialog: Delete Doctor */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (doctorToDelete) {
            deleteDoctor(doctorToDelete.id);
          }
        }}
        title="Remove Doctor from Directory"
        message={`Are you sure you want to remove ${doctorToDelete?.name} (${doctorToDelete?.id}) from active clinical duty? This action removes their appointment schedule and profile.`}
        confirmText="Remove Doctor"
        confirmVariant="danger"
      />
    </div>
  );
};

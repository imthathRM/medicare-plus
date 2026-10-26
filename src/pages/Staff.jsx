import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { DataTable } from '../components/common/DataTable';
import { SearchInput } from '../components/common/SearchInput';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField, Input, Select } from '../components/common/FormField';
import { formatDate } from '../utils/formatters';
import { validateRequired, validateEmail, validatePhone } from '../utils/validators';

export const Staff = () => {
  const { staff, departments, addStaff, updateStaff, deleteStaff } = useHospitalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    role: 'Staff Nurse',
    department: 'Cardiology',
    email: '',
    phone: '',
    shift: 'Morning Shift (07:00 - 15:30)',
    status: 'Active',
    qualification: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);

      const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [staff, searchQuery, departmentFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      role: 'Staff Nurse',
      department: departments[0]?.name || 'Cardiology',
      email: '',
      phone: '',
      shift: 'Morning Shift (07:00 - 15:30)',
      status: 'Active',
      qualification: 'BSc Nursing / Diploma',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (stf) => {
    setSelectedStaff(stf);
    setFormData({
      name: stf.name,
      role: stf.role,
      department: stf.department,
      email: stf.email,
      phone: stf.phone,
      shift: stf.shift,
      status: stf.status,
      qualification: stf.qualification || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenView = (stf) => {
    setSelectedStaff(stf);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (stf) => {
    setStaffToDelete(stf);
    setIsDeleteConfirmOpen(true);
  };

  const validate = () => {
    const errs = {};
    const nameErr = validateRequired(formData.name, 'Full name');
    if (nameErr) errs.name = nameErr;

    const roleErr = validateRequired(formData.role, 'Role title');
    if (roleErr) errs.role = roleErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errs.email = emailErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errs.phone = phoneErr;

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addStaff(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateStaff(selectedStaff.id, formData);
    setIsEditModalOpen(false);
  };

  const columns = [
    {
      header: 'Staff Member',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shrink-0">
            {row.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xs sm:text-sm">{row.name}</p>
            <span className="text-[11px] text-slate-400 font-mono">{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role & Function',
      key: 'role',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 text-xs">{row.role}</span>
          <p className="text-[11px] text-slate-500">{row.department}</p>
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
      header: 'Assigned Shift',
      key: 'shift',
      render: (row) => (
        <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
          {row.shift}
        </span>
      ),
    },
    {
      header: 'Status',
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
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
            title="View Dossier"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F766E] hover:bg-teal-50 transition-colors"
            title="Edit Details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#B91C1C] hover:bg-red-50 transition-colors"
            title="Delete Staff Member"
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
          <h2 className="text-xl font-bold text-[#1E3A5F] tracking-tight">Hospital Staff Directory</h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Nursing administration, laboratory technologists, pharmacy staff, and clinical officers
          </p>
        </div>
        <Button variant="primary" leftIcon={PlusCircle} onClick={handleOpenAdd}>
          Register Staff Member
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by staff name, role, department, or ID..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#334155] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#334155] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </select>

          {(searchQuery || departmentFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Staff Data Table */}
      <DataTable
        columns={columns}
        data={filteredStaff}
        pageSize={8}
        emptyTitle="No staff members found"
        emptyMessage="No personnel records match your search criteria."
        onRowClick={handleOpenView}
      />

      {/* Modal: View Staff Member */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Staff Personnel Dossier"
        description={`Employee ID: ${selectedStaff?.id || ''}`}
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedStaff && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                {selectedStaff.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{selectedStaff.name}</h4>
                  <Badge status={selectedStaff.status} size="sm" />
                </div>
                <p className="text-slate-600 font-medium">{selectedStaff.role}</p>
                <p className="text-slate-400 text-[11px]">{selectedStaff.department}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-slate-700">
              <p>
                <strong>Qualifications:</strong> {selectedStaff.qualification || 'N/A'}
              </p>
              <p>
                <strong>Shift Assignment:</strong> {selectedStaff.shift}
              </p>
              <p>
                <strong>Official Email:</strong> {selectedStaff.email}
              </p>
              <p>
                <strong>Contact Phone:</strong> {selectedStaff.phone}
              </p>
              <p>
                <strong>Date Joined Hospital:</strong> {formatDate(selectedStaff.joinedDate)}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Add Staff Member */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member"
        description="Register healthcare administrative, nursing, or technician personnel."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Save Staff Record
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
                placeholder="e.g. Kumudu Priyadarshani Fernando"
                error={!!formErrors.name}
              />
            </FormField>

            <FormField label="Role Title" required error={formErrors.role}>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Senior Nursing Sister"
                error={!!formErrors.role}
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

            <FormField label="Assigned Shift">
              <Select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              >
                <option value="Morning Shift (07:00 - 15:30)">Morning Shift (07:00 - 15:30)</option>
                <option value="Evening Shift (14:00 - 21:30)">Evening Shift (14:00 - 21:30)</option>
                <option value="Night Shift (21:00 - 07:30)">Night Shift (21:00 - 07:30)</option>
                <option value="Rotational Shift">Rotational Shift</option>
                <option value="General Day (08:00 - 16:30)">General Day (08:00 - 16:30)</option>
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

            <FormField label="Email Address" required error={formErrors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@medicare.plus"
                error={!!formErrors.email}
              />
            </FormField>
          </div>

          <FormField label="Educational / Professional Qualifications">
            <Input
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g. BSc Nursing, Reg. SLMC #8910"
            />
          </FormField>
        </form>
      </Modal>

      {/* Modal: Edit Staff Member */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Staff Record: ${selectedStaff?.name || ''}`}
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

            <FormField label="Role Title" required error={formErrors.role}>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                error={!!formErrors.role}
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

            <FormField label="Assigned Shift">
              <Select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              >
                <option value="Morning Shift (07:00 - 15:30)">Morning Shift (07:00 - 15:30)</option>
                <option value="Evening Shift (14:00 - 21:30)">Evening Shift (14:00 - 21:30)</option>
                <option value="Night Shift (21:00 - 07:30)">Night Shift (21:00 - 07:30)</option>
                <option value="Rotational Shift">Rotational Shift</option>
                <option value="General Day (08:00 - 16:30)">General Day (08:00 - 16:30)</option>
              </Select>
            </FormField>

            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
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
          </div>

          <FormField label="Official Email" required error={formErrors.email}>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
            />
          </FormField>
        </form>
      </Modal>

      {/* Confirmation Dialog: Delete Staff */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (staffToDelete) {
            deleteStaff(staffToDelete.id);
          }
        }}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${staffToDelete?.name} (${staffToDelete?.role}) from the staff registry?`}
        confirmText="Remove Staff"
        confirmVariant="danger"
      />
    </div>
  );
};

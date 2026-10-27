import React, { useState, useMemo } from 'react';
import {
  Building2,
  PlusCircle,
  Users,
  BedDouble,
  Phone,
  MapPin,
  Inbox,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { FormField, Input, Textarea } from '../components/common/FormField';
import { validateRequired, validatePhone, validateNumber } from '../utils/validators';

export const Departments = () => {
  const { departments, doctors, addDepartment, updateDepartment } = useHospitalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    headOfDepartment: '',
    doctorCount: 4,
    bedCount: 20,
    phone: '',
    location: '',
    description: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const q = searchQuery.toLowerCase();
      return (
        dept.name.toLowerCase().includes(q) ||
        dept.code.toLowerCase().includes(q) ||
        dept.headOfDepartment.toLowerCase().includes(q)
      );
    });
  }, [departments, searchQuery]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      headOfDepartment: '',
      doctorCount: 4,
      bedCount: 20,
      phone: '+94 11 268 4500',
      location: 'Building A, Level 2',
      description: '',
      status: 'Active',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      headOfDepartment: dept.headOfDepartment,
      doctorCount: dept.doctorCount,
      bedCount: dept.bedCount,
      phone: dept.phone,
      location: dept.location,
      description: dept.description,
      status: dept.status,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenView = (dept) => {
    setSelectedDept(dept);
    setIsViewModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    const nameErr = validateRequired(formData.name, 'Department name');
    if (nameErr) errs.name = nameErr;

    const codeErr = validateRequired(formData.code, 'Department code');
    if (codeErr) errs.code = codeErr;

    const headErr = validateRequired(formData.headOfDepartment, 'Head of department');
    if (headErr) errs.headOfDepartment = headErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errs.phone = phoneErr;

    const bedErr = validateNumber(formData.bedCount, 'Bed count', 0);
    if (bedErr) errs.bedCount = bedErr;

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addDepartment(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateDepartment(selectedDept.id, formData);
    setIsEditModalOpen(false);
  };

  // Find doctors belonging to selected department
  const departmentDoctors = useMemo(() => {
    if (!selectedDept) return [];
    return doctors.filter((d) => d.department === selectedDept.name);
  }, [doctors, selectedDept]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">Clinical Departments</h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-0.5">
            Operational medical units, ward capacities, and clinical leadership
          </p>
        </div>
        <Button variant="primary" leftIcon={PlusCircle} onClick={handleOpenAdd}>
          Add Department
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow-xs max-w-md transition-colors">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by department name, code, or HOD..."
        />
      </div>

      {/* Department Cards Grid */}
      {filteredDepartments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155] p-5 shadow-xs transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-slate-700 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/40">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A5F] dark:text-[#F1F5F9] text-sm">{dept.name}</h3>
                      <span className="text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                    </div>
                  </div>
                  <Badge status={dept.status} size="sm" />
                </div>

                <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] line-clamp-2 mt-2 leading-relaxed">
                  {dept.description}
                </p>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] space-y-2 text-xs text-[#334155] dark:text-[#CBD5E1]">
                  <p>
                    <strong className="text-[#1E3A5F] dark:text-[#F1F5F9]">HOD:</strong> {dept.headOfDepartment}
                  </p>
                  <div className="flex items-center gap-2 text-[#64748B] dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{dept.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B] dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{dept.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center justify-between text-xs mb-3 bg-[#F7F9FC] dark:bg-slate-800 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                  <div className="flex items-center gap-1.5 font-medium text-[#334155] dark:text-[#CBD5E1]">
                    <Users className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                    <span>{dept.doctorCount} Doctors</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
                    <BedDouble className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#4ADE80]" />
                    <span>{dept.bedCount} Beds</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenView(dept)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Edit
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
          <p className="text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">No departments found</p>
          <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] max-w-sm mx-auto mt-1">
            No clinical departments match your current search criteria.
          </p>
        </div>
      )}

      {/* Modal: View Department Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedDept?.name || 'Department Details'}
        description={`Clinical unit dossier & staff roster (${selectedDept?.code || ''})`}
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedDept && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155] space-y-2">
              <p className="text-slate-700 dark:text-[#CBD5E1] leading-relaxed">{selectedDept.description}</p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-[#334155] grid grid-cols-2 gap-2 text-slate-700 dark:text-[#CBD5E1]">
                <p>
                  <strong className="text-[#1E3A5F] dark:text-[#F1F5F9]">Head of Dept:</strong> {selectedDept.headOfDepartment}
                </p>
                <p>
                  <strong>Internal Hotline:</strong> {selectedDept.phone}
                </p>
                <p>
                  <strong>Location:</strong> {selectedDept.location}
                </p>
                <p>
                  <strong className="text-[#1E3A5F] dark:text-[#F1F5F9]">Ward Capacity:</strong> {selectedDept.bedCount} Beds
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm mb-2">
                Consultants Assigned to {selectedDept.name}
              </h4>
              {departmentDoctors.length > 0 ? (
                <div className="space-y-2">
                  {departmentDoctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-[#F1F5F9]">{doc.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">{doc.specialty}</p>
                      </div>
                      <Badge status={doc.status} size="sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic">No doctors currently listed in this mock department roster.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Add Department */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Department"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Save Department
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Department Name" required error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Oncology"
                error={!!formErrors.name}
              />
            </FormField>

            <FormField label="Code (e.g. ONC)" required error={formErrors.code}>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. ONC"
                error={!!formErrors.code}
              />
            </FormField>
          </div>

          <FormField label="Head of Department (HOD)" required error={formErrors.headOfDepartment}>
            <Input
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              placeholder="e.g. Dr. Rohan Wickramasinghe"
              error={!!formErrors.headOfDepartment}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Bed Capacity" required error={formErrors.bedCount}>
              <Input
                type="number"
                value={formData.bedCount}
                onChange={(e) => setFormData({ ...formData, bedCount: e.target.value })}
                error={!!formErrors.bedCount}
              />
            </FormField>

            <FormField label="Assigned Doctors Count">
              <Input
                type="number"
                value={formData.doctorCount}
                onChange={(e) => setFormData({ ...formData, doctorCount: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Direct Hotline" required error={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+94 11 268 4500"
                error={!!formErrors.phone}
              />
            </FormField>

            <FormField label="Floor / Location">
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Building B, Level 3"
              />
            </FormField>
          </div>

          <FormField label="Department Description">
            <Textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Specialized clinical procedures, diagnostic equipment..."
            />
          </FormField>
        </form>
      </Modal>

      {/* Modal: Edit Department */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Department: ${selectedDept?.name || ''}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Update Department
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Department Name" required error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
              />
            </FormField>

            <FormField label="Code" required error={formErrors.code}>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                error={!!formErrors.code}
              />
            </FormField>
          </div>

          <FormField label="Head of Department" required error={formErrors.headOfDepartment}>
            <Input
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              error={!!formErrors.headOfDepartment}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Bed Capacity" required error={formErrors.bedCount}>
              <Input
                type="number"
                value={formData.bedCount}
                onChange={(e) => setFormData({ ...formData, bedCount: e.target.value })}
                error={!!formErrors.bedCount}
              />
            </FormField>

            <FormField label="Assigned Doctors">
              <Input
                type="number"
                value={formData.doctorCount}
                onChange={(e) => setFormData({ ...formData, doctorCount: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Direct Hotline" required error={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={!!formErrors.phone}
              />
            </FormField>

            <FormField label="Floor / Location">
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Department Description">
            <Textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

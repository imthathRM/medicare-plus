import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BedDouble,
  Eye,
  LogOut,
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
import { formatDate, formatLKR } from '../utils/formatters';
import { validateRequired } from '../utils/validators';

export const Admissions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    admissions,
    patients,
    doctors,
    departments,
    addAdmission,
    dischargeAdmission,
  } = useHospitalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(() => searchParams.get('action') === 'new');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDischargeConfirmOpen, setIsDischargeConfirmOpen] = useState(false);

  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [admissionToDischarge, setAdmissionToDischarge] = useState(null);

  // Form
  const [formData, setFormData] = useState(() => ({
    patientId: patients[0]?.id || '',
    ward: 'Cardiology Special Care Ward',
    bedNumber: 'Bed 101',
    attendingDoctor: doctors[0]?.name || '',
    department: departments[0]?.name || 'Cardiology',
    primaryDiagnosis: '',
    status: 'Admitted',
    dailyRate: 11000,
    emergencyContact: patients[0]?.emergencyContact || '',
    notes: '',
  }));
  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = useCallback(() => {
    setFormData({
      patientId: patients[0]?.id || '',
      ward: 'Cardiology Special Care Ward',
      bedNumber: `Bed ${Math.floor(100 + Math.random() * 800)}`,
      attendingDoctor: doctors[0]?.name || '',
      department: departments[0]?.name || 'Cardiology',
      primaryDiagnosis: '',
      status: 'Admitted',
      dailyRate: 11000,
      emergencyContact: patients[0]?.emergencyContact || '',
      notes: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  }, [patients, doctors, departments]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setSearchParams((prev) => {
        prev.delete('action');
        return prev;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((adm) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        adm.patientName.toLowerCase().includes(q) ||
        adm.id.toLowerCase().includes(q) ||
        adm.ward.toLowerCase().includes(q) ||
        adm.bedNumber.toLowerCase().includes(q) ||
        adm.primaryDiagnosis.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || adm.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [admissions, searchQuery, statusFilter]);

  const handleOpenView = (adm) => {
    setSelectedAdmission(adm);
    setIsViewModalOpen(true);
  };

  const handleOpenDischarge = (adm) => {
    setAdmissionToDischarge(adm);
    setIsDischargeConfirmOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.patientId) errs.patientId = 'Please select a patient';
    const diagErr = validateRequired(formData.primaryDiagnosis, 'Primary diagnosis');
    if (diagErr) errs.primaryDiagnosis = diagErr;
    const wardErr = validateRequired(formData.ward, 'Ward / Room');
    if (wardErr) errs.ward = wardErr;

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const patient = patients.find((p) => p.id === formData.patientId);

    addAdmission({
      ...formData,
      patientName: patient?.name || 'Walk-in Patient',
      emergencyContact: formData.emergencyContact || patient?.emergencyContact || '',
    });

    setIsAddModalOpen(false);
  };

  const columns = [
    {
      header: 'Admission ID',
      key: 'id',
      render: (row) => <span className="font-mono text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]">{row.id}</span>,
    },
    {
      header: 'Patient Info',
      key: 'patientName',
      render: (row) => (
        <div>
          <p className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] text-xs sm:text-sm">{row.patientName}</p>
          <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono">{row.patientId}</span>
        </div>
      ),
    },
    {
      header: 'Ward & Bed Location',
      key: 'ward',
      render: (row) => (
        <div>
          <span className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] text-xs">{row.bedNumber}</span>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate max-w-[180px]">{row.ward}</p>
        </div>
      ),
    },
    {
      header: 'Primary Diagnosis',
      key: 'primaryDiagnosis',
      render: (row) => (
        <span className="text-xs text-[#334155] dark:text-[#CBD5E1] truncate max-w-[200px] block" title={row.primaryDiagnosis}>
          {row.primaryDiagnosis}
        </span>
      ),
    },
    {
      header: 'Admitted On',
      key: 'admissionDate',
      render: (row) => (
        <div className="text-xs text-[#64748B] dark:text-[#CBD5E1] whitespace-nowrap">
          <p className="font-medium text-[#334155] dark:text-[#F1F5F9]">{formatDate(row.admissionDate)}</p>
          {row.dischargeDate && (
            <span className="text-[10px] text-[#64748B] dark:text-slate-400">Disch: {formatDate(row.dischargeDate)}</span>
          )}
        </div>
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
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#CBD5E1] hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status !== 'Discharged' && (
            <button
              onClick={() => handleOpenDischarge(row)}
              className="p-1.5 rounded-lg text-[#64748B] dark:text-[#CBD5E1] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-teal-50 dark:hover:bg-teal-900/40 transition-colors"
              title="Discharge Patient"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">
            Inpatient Admissions & Ward Occupancy
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-0.5">
            Monitor real-time bed allocations, ICU telemetry beds, and discharge workflows
          </p>
        </div>
        <Button variant="primary" leftIcon={BedDouble} onClick={handleOpenAdd}>
          Admit Patient
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient, ward, bed, diagnosis, or ID..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#CBD5E1]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-2 text-[#334155] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20 focus:border-[#2563EB] dark:focus:border-[#60A5FA]"
          >
            <option value="ALL">All Care Levels</option>
            <option value="Admitted">Admitted</option>
            <option value="ICU">ICU / CCU</option>
            <option value="Observation">Under Observation</option>
            <option value="Discharged">Discharged</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="text-xs text-[#2563EB] dark:text-[#60A5FA] hover:underline font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Admissions Data Table */}
      <DataTable
        columns={columns}
        data={filteredAdmissions}
        pageSize={8}
        emptyTitle="No inpatient records found"
        emptyMessage="No active or past inpatient admissions match your search filter."
        onRowClick={handleOpenView}
      />

      {/* Modal: View Admission Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Inpatient Clinical Record"
        description={`Admission Reference ${selectedAdmission?.id || ''}`}
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedAdmission && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155]">
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Patient</p>
                <p className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm">{selectedAdmission.patientName}</p>
                <span className="font-mono text-slate-400 dark:text-slate-500 text-[10px]">{selectedAdmission.patientId}</span>
              </div>
              <Badge status={selectedAdmission.status} size="md" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155] grid grid-cols-2 gap-3 text-slate-700 dark:text-[#CBD5E1]">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Allocated Bed</p>
                <p className="font-bold text-slate-900 dark:text-[#F1F5F9]">{selectedAdmission.bedNumber}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">{selectedAdmission.ward}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Attending Consultant</p>
                <p className="font-semibold text-slate-900 dark:text-[#F1F5F9]">{selectedAdmission.attendingDoctor}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">{selectedAdmission.department}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Admission Date</p>
                <p className="font-medium text-slate-800 dark:text-[#F1F5F9]">{formatDate(selectedAdmission.admissionDate)}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Daily Accommodation Rate</p>
                <p className="font-bold text-slate-900 dark:text-[#F1F5F9]">{formatLKR(selectedAdmission.dailyRate)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Primary Diagnosis</p>
                <p className="font-medium text-slate-900 dark:text-[#F1F5F9]">{selectedAdmission.primaryDiagnosis}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Emergency Contact</p>
                <p className="font-medium text-slate-800 dark:text-[#CBD5E1]">{selectedAdmission.emergencyContact || 'None'}</p>
              </div>
            </div>

            {selectedAdmission.notes && (
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-slate-700/60 border border-sky-100 dark:border-slate-600">
                <p className="font-semibold text-sky-900 dark:text-[#60A5FA] text-[11px] mb-1">Care Notes & Monitoring Orders</p>
                <p className="text-sky-800 dark:text-[#CBD5E1] leading-relaxed">{selectedAdmission.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Admit Patient */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Admit Inpatient"
        description="Allocate hospital ward bed and assign attending clinical consultant."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Complete Admission
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Select Patient" required error={formErrors.patientId}>
              <Select
                value={formData.patientId}
                onChange={(e) => {
                  const patId = e.target.value;
                  const found = patients.find((p) => p.id === patId);
                  setFormData({
                    ...formData,
                    patientId: patId,
                    emergencyContact: found?.emergencyContact || '',
                  });
                }}
                error={!!formErrors.patientId}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) — {p.status}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Attending Consultant Doctor">
              <Select
                value={formData.attendingDoctor}
                onChange={(e) => setFormData({ ...formData, attendingDoctor: e.target.value })}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.department})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Ward / Unit" required error={formErrors.ward}>
              <Select
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              >
                <option value="Cardiology Special Care Ward">Cardiology Special Care Ward</option>
                <option value="Orthopedic Post-Operative Ward">Orthopedic Post-Operative Ward</option>
                <option value="Maternity & Antenatal HDU">Maternity & Antenatal HDU</option>
                <option value="Coronary Care Unit (CCU / ICU)">Coronary Care Unit (CCU / ICU)</option>
                <option value="General Surgical Step-Down">General Surgical Step-Down</option>
                <option value="Pediatric High Care Ward">Pediatric High Care Ward</option>
              </Select>
            </FormField>

            <FormField label="Bed Number">
              <Input
                value={formData.bedNumber}
                onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                placeholder="e.g. Bed 204 or ICU-01"
              />
            </FormField>

            <FormField label="Care Level / Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Admitted">Admitted (General)</option>
                <option value="ICU">ICU / Intensive Care</option>
                <option value="Observation">Under Observation</option>
              </Select>
            </FormField>

            <FormField label="Daily Bed Rate (LKR)">
              <Input
                type="number"
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <FormField label="Primary Admission Diagnosis" required error={formErrors.primaryDiagnosis}>
            <Input
              value={formData.primaryDiagnosis}
              onChange={(e) => setFormData({ ...formData, primaryDiagnosis: e.target.value })}
              placeholder="e.g. Acute Coronary Syndrome, Femur Fracture, etc."
              error={!!formErrors.primaryDiagnosis}
            />
          </FormField>

          <FormField label="Emergency Contact Details">
            <Input
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Name, relationship, and contact number"
            />
          </FormField>

          <FormField label="Clinical Monitoring Notes">
            <Textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special dietary instructions, telemetry orders, medication schedule..."
            />
          </FormField>
        </form>
      </Modal>

      {/* Confirmation: Discharge Patient */}
      <ConfirmDialog
        isOpen={isDischargeConfirmOpen}
        onClose={() => setIsDischargeConfirmOpen(false)}
        onConfirm={() => {
          if (admissionToDischarge) {
            dischargeAdmission(admissionToDischarge.id);
          }
        }}
        title="Discharge Patient"
        message={`Are you sure you want to mark ${admissionToDischarge?.patientName} as discharged from ${admissionToDischarge?.bedNumber}? This will release the bed back to the ward inventory.`}
        confirmText="Confirm Discharge"
        confirmVariant="primary"
      />
    </div>
  );
};

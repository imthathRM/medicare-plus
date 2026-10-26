import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarPlus,
  Eye,
  XCircle,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { DataTable } from '../components/common/DataTable';
import { SearchInput } from '../components/common/SearchInput';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField, Input, Select, Textarea } from '../components/common/FormField';
import { formatDate, formatTime, formatLKR } from '../utils/formatters';
import { validateRequired } from '../utils/validators';

export const Appointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    appointments,
    patients,
    doctors,
    addAppointment,
    updateAppointmentStatus,
    cancelAppointment,
  } = useHospitalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '2026-10-15',
    time: '10:00',
    type: 'Consultation',
    status: 'Confirmed',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = useCallback(() => {
    setFormData({
      patientId: patients[0]?.id || '',
      doctorId: doctors[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:30',
      type: 'Consultation',
      status: 'Confirmed',
      notes: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  }, [patients, doctors]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenAdd();
      setSearchParams((prev) => {
        prev.delete('action');
        return prev;
      });
    }
  }, [searchParams, setSearchParams, handleOpenAdd]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        apt.patientName.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.department.toLowerCase().includes(q) ||
        apt.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
      const matchesDate = !dateFilter || apt.date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  const handleOpenView = (apt) => {
    setSelectedAppointment(apt);
    setIsViewModalOpen(true);
  };

  const handleOpenCancel = (apt) => {
    setAppointmentToCancel(apt);
    setIsCancelConfirmOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.patientId) errs.patientId = 'Please select a patient';
    if (!formData.doctorId) errs.doctorId = 'Please select a consultant doctor';
    const dateErr = validateRequired(formData.date, 'Appointment date');
    if (dateErr) errs.date = dateErr;
    const timeErr = validateRequired(formData.time, 'Appointment time');
    if (timeErr) errs.time = timeErr;

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const patient = patients.find((p) => p.id === formData.patientId);
    const doc = doctors.find((d) => d.id === formData.doctorId);

    addAppointment({
      ...formData,
      patientName: patient?.name || 'Walk-in Patient',
      doctorName: doc?.name || 'General Consultant',
      department: doc?.department || 'General Care',
      room: doc?.roomNumber || 'Consultation Suite',
      fee: doc?.consultationFee || 3500,
    });

    setIsAddModalOpen(false);
  };

  const columns = [
    {
      header: 'Appt ID',
      key: 'id',
      render: (row) => <span className="font-mono text-xs text-slate-700 font-semibold">{row.id}</span>,
    },
    {
      header: 'Patient',
      key: 'patientName',
      render: (row) => (
        <div>
          <p className="font-semibold text-[#1E3A5F] text-xs sm:text-sm">{row.patientName}</p>
          <span className="text-[11px] text-[#64748B] font-mono">{row.patientId}</span>
        </div>
      ),
    },
    {
      header: 'Consultant & Dept',
      key: 'doctorName',
      render: (row) => (
        <div>
          <p className="font-medium text-[#334155] text-xs sm:text-sm">{row.doctorName}</p>
          <span className="text-[11px] text-[#64748B]">{row.department}</span>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      key: 'dateTime',
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium text-[#334155] whitespace-nowrap">{formatDate(row.date)}</p>
          <span className="text-[#64748B] font-medium">{formatTime(row.time)}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'type',
      render: (row) => (
        <span className="text-xs font-medium text-[#334155] bg-[#F7F9FC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-full">
          {row.type}
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
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status !== 'Completed' && row.status !== 'Cancelled' && (
            <button
              onClick={() => updateAppointmentStatus(row.id, 'Completed')}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#15803D] hover:bg-emerald-50 transition-colors"
              title="Mark Completed"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          {row.status !== 'Cancelled' && row.status !== 'Completed' && (
            <button
              onClick={() => handleOpenCancel(row)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#B91C1C] hover:bg-red-50 transition-colors"
              title="Cancel Appointment"
            >
              <XCircle className="w-4 h-4" />
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
          <h2 className="text-xl font-bold text-[#1E3A5F] tracking-tight">
            Appointment Scheduling
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Book consultations, track specialist queues, and manage clinical visits
          </p>
        </div>
        <Button variant="primary" leftIcon={CalendarPlus} onClick={handleOpenAdd}>
          New Appointment
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient, doctor, or ID..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#334155] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[#334155] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />

          {(searchQuery || statusFilter !== 'ALL' || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setDateFilter('');
              }}
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Appointments Data Table */}
      <DataTable
        columns={columns}
        data={filteredAppointments}
        pageSize={8}
        emptyTitle="No appointments found"
        emptyMessage="No consultation bookings match your current filter parameters."
        onRowClick={handleOpenView}
      />

      {/* Modal: View Appointment */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Appointment Booking Details"
        description={`Record ${selectedAppointment?.id || ''}`}
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedAppointment && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-[11px] text-slate-500">Booking Reference</p>
                <p className="font-bold text-slate-900 font-mono text-sm">{selectedAppointment.id}</p>
              </div>
              <Badge status={selectedAppointment.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
              <div>
                <p className="text-slate-500 text-[11px]">Patient</p>
                <p className="font-semibold text-slate-900">{selectedAppointment.patientName}</p>
                <p className="font-mono text-slate-400 text-[10px]">{selectedAppointment.patientId}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Doctor</p>
                <p className="font-semibold text-slate-900">{selectedAppointment.doctorName}</p>
                <p className="text-slate-500 text-[11px]">{selectedAppointment.department}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Date & Time</p>
                <p className="font-medium text-slate-800">
                  {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Clinic Location</p>
                <p className="font-medium text-slate-800">{selectedAppointment.room || 'Clinic Suite'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Visit Type</p>
                <p className="font-medium text-slate-800">{selectedAppointment.type}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Consultation Fee</p>
                <p className="font-bold text-slate-900">{formatLKR(selectedAppointment.fee)}</p>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100">
                <p className="font-semibold text-sky-900 text-[11px] mb-1">Clinical Notes & Symptoms</p>
                <p className="text-sky-800">{selectedAppointment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: New Appointment */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule New Appointment"
        description="Book a consultant specialist or diagnostic review."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Confirm Booking
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Select Patient" required error={formErrors.patientId}>
              <Select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                error={!!formErrors.patientId}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Select Consultant Doctor" required error={formErrors.doctorId}>
              <Select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                error={!!formErrors.doctorId}
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.department} ({formatLKR(d.consultationFee)})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Appointment Date" required error={formErrors.date}>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={!!formErrors.date}
              />
            </FormField>

            <FormField label="Appointment Time" required error={formErrors.time}>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                error={!!formErrors.time}
              />
            </FormField>

            <FormField label="Appointment Type">
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Checkup">Routine Checkup</option>
                <option value="Review">Post-Op Review</option>
                <option value="Emergency">Emergency Triage</option>
              </Select>
            </FormField>

            <FormField label="Initial Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Scheduled">Scheduled</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Clinical Reason / Notes">
            <Textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Primary symptoms, referral information, or clinical observations..."
            />
          </FormField>
        </form>
      </Modal>

      {/* Confirmation: Cancel Appointment */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={() => {
          if (appointmentToCancel) {
            cancelAppointment(appointmentToCancel.id, 'Cancelled via appointment dashboard');
          }
        }}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel the appointment for ${appointmentToCancel?.patientName} with ${appointmentToCancel?.doctorName} on ${formatDate(appointmentToCancel?.date)}?`}
        confirmText="Yes, Cancel Booking"
        confirmVariant="danger"
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarCheck2,
  BedDouble,
  UserPlus,
  CalendarPlus,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AppointmentTrendChart } from '../components/charts/AppointmentTrendChart';
import { formatDate, formatTime } from '../utils/formatters';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    dashboardStats,
    appointments,
    patients,
    hospitalProfile,
  } = useHospitalData();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Upcoming appointments (e.g. today's scheduled)
  const upcomingAppointments = appointments
    .filter((a) => a.status === 'Confirmed' || a.status === 'Scheduled' || a.status === 'In Progress')
    .slice(0, 5);

  // Recent registered patients
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.registeredDate) - new Date(a.registeredDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner & Primary Actions */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-[#4ADE80] text-xs font-semibold mb-1.5">
            <HeartPulse className="w-3.5 h-3.5" />
            Hospital Operations: Normal
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">
            {hospitalProfile.name || 'MediCare Plus Hospital'}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-0.5">
            Essential clinical overview and daily operational metrics
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={UserPlus}
            onClick={() => navigate('/patients?action=new')}
          >
            Register Patient
          </Button>
          <Button
            variant="teal"
            size="md"
            leftIcon={CalendarPlus}
            onClick={() => navigate('/appointments?action=new')}
          >
            New Appointment
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={dashboardStats.totalPatients}
          icon={Users}
          colorTheme="blue"
          trend="+12%"
          trendDirection="up"
          trendText="active records"
          onClick={() => navigate('/patients')}
        />
        <StatCard
          title="Active Doctors"
          value={dashboardStats.totalDoctors}
          icon={UserCheck}
          colorTheme="teal"
          trend="Clinical Specialists"
          trendDirection="neutral"
          onClick={() => navigate('/doctors')}
        />
        <StatCard
          title="Today's Appointments"
          value={dashboardStats.todayAppointments}
          icon={CalendarCheck2}
          colorTheme="emerald"
          trend="Consultations scheduled"
          trendDirection="up"
          onClick={() => navigate('/appointments')}
        />
        <StatCard
          title="Bed Occupancy"
          value={`${dashboardStats.occupancyRate}%`}
          icon={BedDouble}
          colorTheme="amber"
          trend={`${dashboardStats.occupiedBeds} of ${dashboardStats.totalBeds} beds`}
          trendDirection="neutral"
          onClick={() => navigate('/admissions')}
        />
      </div>

      {/* Essential Activity Chart */}
      <Card
        title="Consultation & Appointment Activity"
        subtitle="Monthly volume of scheduled and completed clinical consultations"
        action={
          <Button
            variant="ghost"
            size="sm"
            rightIcon={ArrowRight}
            onClick={() => navigate('/reports')}
          >
            View Full Analytics
          </Button>
        }
      >
        <div className="pt-2">
          <AppointmentTrendChart />
        </div>
      </Card>

      {/* Recent Activity: Upcoming Appointments & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Consultations Table */}
        <Card
          title="Upcoming Consultations"
          subtitle="Click any appointment to view clinical details"
          action={
            <Button
              variant="outline"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/appointments')}
            >
              All Appointments
            </Button>
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F9FC] dark:bg-slate-800/90 border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#CBD5E1] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Doctor</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {upcomingAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className="hover:bg-blue-50/30 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">{apt.patientName}</p>
                      <span className="text-[11px] text-[#64748B] dark:text-[#CBD5E1]">{apt.patientId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#334155] dark:text-[#F1F5F9]">{apt.doctorName}</p>
                      <span className="text-[11px] text-[#64748B] dark:text-[#CBD5E1]">{apt.department}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#334155] dark:text-[#CBD5E1] font-medium whitespace-nowrap">
                      {formatTime(apt.time)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge status={apt.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Patients Table */}
        <Card
          title="Recent Patient Registrations"
          subtitle="Click any patient to view electronic medical record"
          action={
            <Button
              variant="outline"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/patients')}
            >
              All Patients
            </Button>
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F9FC] dark:bg-slate-800/90 border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#CBD5E1] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Age & Gender</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {recentPatients.map((pat) => (
                  <tr
                    key={pat.id}
                    onClick={() => setSelectedPatient(pat)}
                    className="hover:bg-blue-50/30 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">{pat.name}</p>
                      <span className="text-[11px] text-[#64748B] dark:text-[#CBD5E1]">{pat.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-[#334155] dark:text-[#F1F5F9]">{pat.age || '—'} yrs</span>
                      <span className="text-[11px] ml-1.5 text-[#64748B] dark:text-[#CBD5E1]">
                        ({pat.gender})
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B] dark:text-[#CBD5E1] text-xs whitespace-nowrap">
                      {formatDate(pat.registeredDate)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge status={pat.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Details-on-Demand: Quick Appointment Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          title="Appointment Summary"
          description={`Reference ID: ${selectedAppointment.id}`}
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAppointment(null);
                  navigate('/appointments');
                }}
              >
                Go to Appointments
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155]">
              <div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">Status</p>
                <div className="mt-1">
                  <Badge status={selectedAppointment.status} size="sm" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">Scheduled Time</p>
                <p className="font-semibold text-sm text-[#1E3A5F] dark:text-[#F1F5F9]">
                  {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155]">
              <div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">Patient</p>
                <p className="font-semibold text-sm text-[#1E3A5F] dark:text-[#F1F5F9]">{selectedAppointment.patientName}</p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">{selectedAppointment.patientPhone || selectedAppointment.patientId}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">Attending Doctor</p>
                <p className="font-semibold text-sm text-[#1E3A5F] dark:text-[#F1F5F9]">{selectedAppointment.doctorName}</p>
                <p className="text-[11px] text-[#2563EB] dark:text-[#60A5FA] font-medium">{selectedAppointment.department}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Details-on-Demand: Quick Patient Modal */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title="Patient Quick Summary"
          description={`Patient ID: ${selectedPatient.id}`}
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPatient(null);
                  navigate('/patients');
                }}
              >
                Go to Patients Page
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155]">
              <div>
                <p className="font-bold text-base text-[#1E3A5F] dark:text-[#F1F5F9]">{selectedPatient.name}</p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                  {selectedPatient.gender} • {selectedPatient.age || '—'} years • Blood Group: {selectedPatient.bloodGroup || 'N/A'}
                </p>
              </div>
              <Badge status={selectedPatient.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155]">
              <div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">Contact</p>
                <p className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">{selectedPatient.phone || 'No phone'}</p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">{selectedPatient.email || 'No email'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">Department</p>
                <p className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">{selectedPatient.department || 'General Care'}</p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">Doctor: {selectedPatient.attendingDoctor || 'On Duty'}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

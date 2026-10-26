import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarCheck2,
  BedDouble,
  UserPlus,
  CalendarPlus,
  Receipt,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AppointmentTrendChart } from '../components/charts/AppointmentTrendChart';
import { DepartmentDistributionChart } from '../components/charts/DepartmentDistributionChart';
import { formatDate, formatTime } from '../utils/formatters';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    dashboardStats,
    appointments,
    patients,
    departments,
    hospitalProfile,
  } = useHospitalData();

  // Upcoming appointments (e.g., today's or pending)
  const upcomingAppointments = appointments
    .filter((a) => a.status === 'Confirmed' || a.status === 'Scheduled' || a.status === 'In Progress')
    .slice(0, 5);

  // Recent patients
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.registeredDate) - new Date(a.registeredDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-semibold mb-2">
            <HeartPulse className="w-3.5 h-3.5 text-[#2563EB]" />
            Operational Status: Normal
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A5F] tracking-tight">
            MediCare Plus Clinical Administration
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-xl">
            Real-time hospital intelligence overview for {hospitalProfile.name}. Managing patient admissions, specialist consultations, and bed capacities.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
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
          <Button
            variant="secondary"
            size="md"
            leftIcon={BedDouble}
            onClick={() => navigate('/admissions?action=new')}
          >
            Admit Patient
          </Button>
          <Button
            variant="secondary"
            size="md"
            leftIcon={Receipt}
            onClick={() => navigate('/billing?action=new')}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Registered Patients"
          value={dashboardStats.totalPatients}
          icon={Users}
          colorTheme="blue"
          trend="+12%"
          trendDirection="up"
          trendText="vs last month"
          onClick={() => navigate('/patients')}
        />
        <StatCard
          title="Consultants & Doctors"
          value={dashboardStats.totalDoctors}
          icon={UserCheck}
          colorTheme="teal"
          trend="8 Departments"
          trendDirection="neutral"
          onClick={() => navigate('/doctors')}
        />
        <StatCard
          title="Today's Appointments"
          value={dashboardStats.todayAppointments}
          icon={CalendarCheck2}
          colorTheme="emerald"
          trend="4 in-progress"
          trendDirection="up"
          onClick={() => navigate('/appointments')}
        />
        <StatCard
          title="Current Inpatients"
          value={dashboardStats.activeAdmissions}
          icon={BedDouble}
          colorTheme="amber"
          trend={`${dashboardStats.occupancyRate}% Bed Occupancy`}
          trendDirection="neutral"
          subtext={`${dashboardStats.occupiedBeds} of ${dashboardStats.totalBeds} beds occupied`}
          onClick={() => navigate('/admissions')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Trend Chart */}
        <div className="lg:col-span-2">
          <Card
            title="Appointment Volume & Consultations"
            subtitle="Monthly comparison of completed vs scheduled appointments"
            action={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={ArrowRight}
                onClick={() => navigate('/reports')}
              >
                Full Analytics
              </Button>
            }
          >
            <div className="pt-2">
              <AppointmentTrendChart />
            </div>
          </Card>
        </div>

        {/* Patient Distribution by Department */}
        <div>
          <Card
            title="Patient Distribution"
            subtitle="Admissions and visits across key clinical specialties"
            action={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={ArrowRight}
                onClick={() => navigate('/departments')}
              >
                Departments
              </Button>
            }
          >
            <div className="pt-2">
              <DepartmentDistributionChart />
            </div>
          </Card>
        </div>
      </div>

      {/* Tables Row: Upcoming Appointments & Recent Patient Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments Table */}
        <Card
          title="Upcoming Appointments"
          subtitle="Specialist consultations scheduled for today"
          action={
            <Button
              variant="outline"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/appointments')}
            >
              View All
            </Button>
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F9FC] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Doctor & Dept</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {upcomingAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1E3A5F]">{apt.patientName}</p>
                      <span className="text-[11px] text-[#64748B]">{apt.patientId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#334155]">{apt.doctorName}</p>
                      <span className="text-[11px] text-[#64748B]">{apt.department}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#334155] font-medium whitespace-nowrap">
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

        {/* Recent Patient Registrations */}
        <Card
          title="Recent Patient Registrations"
          subtitle="New electronic medical records created in registry"
          action={
            <Button
              variant="outline"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/patients')}
            >
              View Registry
            </Button>
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F9FC] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Age / Blood</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1E3A5F]">{pat.name}</p>
                      <span className="text-[11px] text-[#64748B]">{pat.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-[#334155]">{pat.age} yrs</span>
                      <span className="text-[11px] ml-1.5 px-1.5 py-0.5 rounded bg-[#F7F9FC] border border-[#E2E8F0] font-semibold text-[#64748B]">
                        {pat.bloodGroup}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B] text-xs whitespace-nowrap">
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

      {/* Clinical Department Summary Cards */}
      <Card
        title="Department Bed & Resource Summary"
        subtitle="Current ward allocations, clinical staff headcounts, and bed capacities"
        action={
          <Button
            variant="ghost"
            size="sm"
            rightIcon={ArrowRight}
            onClick={() => navigate('/departments')}
          >
            Manage Departments
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {departments.slice(0, 4).map((dept) => (
            <div
              key={dept.id}
              className="p-4 rounded-lg bg-[#F7F9FC] border border-[#E2E8F0] hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                  {dept.code}
                </span>
                <span className="text-xs font-semibold text-[#15803D] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                  {dept.status}
                </span>
              </div>
              <h4 className="font-semibold text-[#1E3A5F] text-sm truncate">{dept.name}</h4>
              <p className="text-xs text-[#64748B] mt-0.5 truncate">{dept.headOfDepartment}</p>
              <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <span>{dept.doctorCount} Doctors</span>
                <span className="font-semibold text-[#1E3A5F]">{dept.bedCount} Beds</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

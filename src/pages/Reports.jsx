import React, { useState } from 'react';
import {
  Printer,
  HeartPulse,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart';
import { AppointmentTrendChart } from '../components/charts/AppointmentTrendChart';
import { DepartmentDistributionChart } from '../components/charts/DepartmentDistributionChart';
import { formatLKR, formatDate } from '../utils/formatters';

export const Reports = () => {
  const { hospitalProfile, dashboardStats, invoices, appointments } = useHospitalData();
  const [selectedPeriod, setSelectedPeriod] = useState('Oct 2026');
  const [generatedDate] = useState(() => formatDate(new Date().toISOString()));

  // Calculate live billing metrics in LKR
  const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
  const outstandingReceivables = Math.max(0, totalBilled - totalCollected);

  const completedApts = appointments.filter((a) => a.status === 'Completed').length;
  const scheduledApts = appointments.filter((a) => a.status === 'Scheduled' || a.status === 'Confirmed').length;

  return (
    <div className="space-y-6">
      {/* Header & Print Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Hospital Analytics & Operational Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit-ready clinical indicators, revenue tracking (in LKR), and bed occupancy reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="Oct 2026">Current Reporting Period (Oct 2026)</option>
            <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
            <option value="Annual 2026">Annual Financial Year 2026</option>
          </select>

          <Button
            variant="primary"
            leftIcon={Printer}
            onClick={() => window.print()}
          >
            Print Executive Report
          </Button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs print-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-md">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {hospitalProfile.name}
              </h3>
              <p className="text-xs text-slate-500">
                {hospitalProfile.address} • Reg: {hospitalProfile.registrationNumber}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-800">Operational Performance Audit</p>
            <p>Period: <strong className="text-slate-900">{selectedPeriod}</strong></p>
            <p className="text-[11px] text-slate-400">Generated: {generatedDate}</p>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Revenue (Billed)</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{formatLKR(totalBilled)}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Recorded across active invoices</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Collections Received</p>
            <p className="text-lg font-bold text-emerald-700 mt-1">{formatLKR(totalCollected)}</p>
            <span className="text-[11px] text-slate-500 font-medium">Cash & settled claims</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Outstanding Balance</p>
            <p className="text-lg font-bold text-rose-600 mt-1">{formatLKR(outstandingReceivables)}</p>
            <span className="text-[11px] text-rose-500 font-medium">Pending insurance & patient dues</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bed Occupancy Rate</p>
            <p className="text-lg font-bold text-sky-700 mt-1">{dashboardStats.occupancyRate}%</p>
            <span className="text-[11px] text-slate-500 font-medium">
              {dashboardStats.occupiedBeds} occupied / {dashboardStats.totalBeds} total
            </span>
          </div>
        </div>
      </div>

      {/* Financial & Revenue Chart */}
      <Card
        title="Revenue Breakdown: Inpatient Wards vs Outpatient Diagnostics"
        subtitle="Historical revenue trajectories in Sri Lankan Rupees (LKR)"
        className="print-card"
      >
        <div className="pt-2">
          <RevenueTrendChart height={300} />
        </div>
      </Card>

      {/* Appointment & Clinical Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Clinical Consultations & Procedure Volume"
          subtitle="Monthly trend analysis of specialist appointments"
          className="print-card"
        >
          <div className="pt-2">
            <AppointmentTrendChart height={260} />
          </div>
        </Card>

        <Card
          title="Patient Specialty Distribution"
          subtitle="Clinical load proportion by primary specialty"
          className="print-card"
        >
          <div className="pt-2">
            <DepartmentDistributionChart height={260} />
          </div>
        </Card>
      </div>

      {/* Summary Audit Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-card">
        {/* Appointments Summary Breakdown */}
        <Card title="Appointment Status Summary" subtitle="Current schedule disposition">
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Completed Consultations</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {completedApts} visits
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Confirmed / In-Progress</span>
              <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                {scheduledApts} bookings
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Total Bookings in Registry</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {appointments.length} records
              </span>
            </div>
          </div>
        </Card>

        {/* Admission Occupancy Summary */}
        <Card title="Inpatient Ward Utilization" subtitle="Current inpatient care indicators">
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Current Inpatients</span>
              <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                {dashboardStats.activeAdmissions} patients
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Available Ready Beds</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {Math.max(0, dashboardStats.totalBeds - dashboardStats.occupiedBeds)} beds
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Hospital Ward Capacity</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {dashboardStats.totalBeds} licensed beds
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

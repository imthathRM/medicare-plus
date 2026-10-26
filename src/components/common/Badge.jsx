import React from 'react';

const BADGE_VARIANTS = {
  // Success (#15803D)
  Active: 'bg-emerald-50 text-[#15803D] border-emerald-200 ring-emerald-500/10',
  Confirmed: 'bg-emerald-50 text-[#15803D] border-emerald-200 ring-emerald-500/10',
  Paid: 'bg-emerald-50 text-[#15803D] border-emerald-200 ring-emerald-500/10',
  Available: 'bg-emerald-50 text-[#15803D] border-emerald-200 ring-emerald-500/10',
  Completed: 'bg-emerald-50 text-[#15803D] border-emerald-200 ring-emerald-500/10',
  Normal: 'bg-emerald-50 text-[#15803D] border-emerald-200 ring-emerald-500/10',
  
  // Primary Blue (#2563EB)
  Inpatient: 'bg-blue-50 text-[#2563EB] border-blue-200 ring-blue-500/10',
  Admitted: 'bg-blue-50 text-[#2563EB] border-blue-200 ring-blue-500/10',
  Scheduled: 'bg-blue-50 text-[#2563EB] border-blue-200 ring-blue-500/10',
  'In Progress': 'bg-blue-50 text-[#2563EB] border-blue-200 ring-blue-500/10',
  'On Duty': 'bg-blue-50 text-[#2563EB] border-blue-200 ring-blue-500/10',

  // Teal Accent (#0F766E)
  Consulting: 'bg-teal-50 text-[#0F766E] border-teal-200 ring-teal-500/10',
  Ward: 'bg-teal-50 text-[#0F766E] border-teal-200 ring-teal-500/10',

  // Warning (#B45309)
  'Under Observation': 'bg-amber-50 text-[#B45309] border-amber-200 ring-amber-500/10',
  Observation: 'bg-amber-50 text-[#B45309] border-amber-200 ring-amber-500/10',
  Pending: 'bg-amber-50 text-[#B45309] border-amber-200 ring-amber-500/10',
  'Partially Paid': 'bg-amber-50 text-[#B45309] border-amber-200 ring-amber-500/10',
  'In Surgery': 'bg-amber-50 text-[#B45309] border-amber-200 ring-amber-500/10',
  'On Leave': 'bg-amber-50 text-[#B45309] border-amber-200 ring-amber-500/10',

  // Error / Critical (#B91C1C)
  ICU: 'bg-red-50 text-[#B91C1C] border-red-200 ring-red-500/10',
  Cancelled: 'bg-red-50 text-[#B91C1C] border-red-200 ring-red-500/10',
  Overdue: 'bg-red-50 text-[#B91C1C] border-red-200 ring-red-500/10',
  'Low Stock': 'bg-red-50 text-[#B91C1C] border-red-200 ring-red-500/10',
  Critical: 'bg-red-50 text-[#B91C1C] border-red-200 ring-red-500/10',

  // Neutral / Secondary Text (#64748B)
  Discharged: 'bg-slate-100 text-[#64748B] border-[#E2E8F0] ring-slate-500/10',
  Outpatient: 'bg-slate-100 text-[#64748B] border-[#E2E8F0] ring-slate-500/10',
  Inactive: 'bg-slate-100 text-[#64748B] border-[#E2E8F0] ring-slate-500/10',
};

export const Badge = ({
  children,
  status,
  size = 'md',
  dot = true,
  className = '',
}) => {
  const key = status || children;
  const style = BADGE_VARIANTS[key] || 'bg-slate-100 text-[#64748B] border-[#E2E8F0]';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ring-1 ring-inset ${sizeClasses[size]} ${style} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            style.includes('emerald')
              ? 'bg-[#15803D]'
              : style.includes('blue')
              ? 'bg-[#2563EB]'
              : style.includes('teal')
              ? 'bg-[#0F766E]'
              : style.includes('amber')
              ? 'bg-[#B45309]'
              : style.includes('red')
              ? 'bg-[#B91C1C]'
              : 'bg-[#64748B]'
          }`}
        />
      )}
      {children || status}
    </span>
  );
};

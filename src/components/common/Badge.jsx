import React from 'react';

const BADGE_VARIANTS = {
  // Success (#15803D / #4ADE80)
  Active: 'bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-[#4ADE80] border-emerald-200 dark:border-emerald-800/40 ring-emerald-500/10',
  Confirmed: 'bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-[#4ADE80] border-emerald-200 dark:border-emerald-800/40 ring-emerald-500/10',
  Paid: 'bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-[#4ADE80] border-emerald-200 dark:border-emerald-800/40 ring-emerald-500/10',
  Available: 'bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-[#4ADE80] border-emerald-200 dark:border-emerald-800/40 ring-emerald-500/10',
  Completed: 'bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-[#4ADE80] border-emerald-200 dark:border-emerald-800/40 ring-emerald-500/10',
  Normal: 'bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-[#4ADE80] border-emerald-200 dark:border-emerald-800/40 ring-emerald-500/10',
  
  // Primary Blue (#2563EB / #60A5FA)
  Inpatient: 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border-blue-200 dark:border-blue-800/40 ring-blue-500/10',
  Admitted: 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border-blue-200 dark:border-blue-800/40 ring-blue-500/10',
  Scheduled: 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border-blue-200 dark:border-blue-800/40 ring-blue-500/10',
  'In Progress': 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border-blue-200 dark:border-blue-800/40 ring-blue-500/10',
  'On Duty': 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border-blue-200 dark:border-blue-800/40 ring-blue-500/10',

  // Teal Accent (#0F766E / #2DD4BF)
  Consulting: 'bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-[#2DD4BF] border-teal-200 dark:border-teal-800/40 ring-teal-500/10',
  Ward: 'bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-[#2DD4BF] border-teal-200 dark:border-teal-800/40 ring-teal-500/10',

  // Warning (#B45309 / #FBBF24)
  'Under Observation': 'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-[#FBBF24] border-amber-200 dark:border-amber-800/40 ring-amber-500/10',
  Observation: 'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-[#FBBF24] border-amber-200 dark:border-amber-800/40 ring-amber-500/10',
  Pending: 'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-[#FBBF24] border-amber-200 dark:border-amber-800/40 ring-amber-500/10',
  'Partially Paid': 'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-[#FBBF24] border-amber-200 dark:border-amber-800/40 ring-amber-500/10',
  'In Surgery': 'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-[#FBBF24] border-amber-200 dark:border-amber-800/40 ring-amber-500/10',
  'On Leave': 'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-[#FBBF24] border-amber-200 dark:border-amber-800/40 ring-amber-500/10',

  // Error / Critical (#B91C1C / #F87171)
  ICU: 'bg-red-50 dark:bg-red-950/60 text-[#B91C1C] dark:text-[#F87171] border-red-200 dark:border-red-800/40 ring-red-500/10',
  Cancelled: 'bg-red-50 dark:bg-red-950/60 text-[#B91C1C] dark:text-[#F87171] border-red-200 dark:border-red-800/40 ring-red-500/10',
  Overdue: 'bg-red-50 dark:bg-red-950/60 text-[#B91C1C] dark:text-[#F87171] border-red-200 dark:border-red-800/40 ring-red-500/10',
  'Low Stock': 'bg-red-50 dark:bg-red-950/60 text-[#B91C1C] dark:text-[#F87171] border-red-200 dark:border-red-800/40 ring-red-500/10',
  Critical: 'bg-red-50 dark:bg-red-950/60 text-[#B91C1C] dark:text-[#F87171] border-red-200 dark:border-red-800/40 ring-red-500/10',

  // Neutral / Secondary Text (#64748B / #CBD5E1)
  Discharged: 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155] ring-slate-500/10',
  Outpatient: 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155] ring-slate-500/10',
  Inactive: 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155] ring-slate-500/10',
};

export const Badge = ({
  children,
  status,
  size = 'md',
  dot = true,
  className = '',
}) => {
  const key = status || children;
  const style = BADGE_VARIANTS[key] || 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]';

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

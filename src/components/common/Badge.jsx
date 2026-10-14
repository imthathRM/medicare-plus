import React from 'react';

const BADGE_VARIANTS = {
  // Emerald / Success
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
  Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
  Normal: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
  
  // Sky / Medical Blue
  Inpatient: 'bg-sky-50 text-sky-700 border-sky-200/80 ring-sky-500/10',
  Admitted: 'bg-sky-50 text-sky-700 border-sky-200/80 ring-sky-500/10',
  Scheduled: 'bg-sky-50 text-sky-700 border-sky-200/80 ring-sky-500/10',
  'In Progress': 'bg-sky-50 text-sky-700 border-sky-200/80 ring-sky-500/10',
  'On Duty': 'bg-sky-50 text-sky-700 border-sky-200/80 ring-sky-500/10',

  // Amber / Warning / In-Between
  'Under Observation': 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',
  Observation: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',
  Pending: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',
  'Partially Paid': 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',
  'In Surgery': 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',
  'On Leave': 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',

  // Red / Rose / Critical
  ICU: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/10',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/10',
  Overdue: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/10',
  'Low Stock': 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/10',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/10',

  // Slate / Neutral
  Discharged: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
  Outpatient: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10',
};

export const Badge = ({
  children,
  status,
  size = 'md',
  dot = true,
  className = '',
}) => {
  const key = status || children;
  const style = BADGE_VARIANTS[key] || 'bg-slate-100 text-slate-700 border-slate-200';

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
              ? 'bg-emerald-500'
              : style.includes('sky')
              ? 'bg-sky-500'
              : style.includes('amber')
              ? 'bg-amber-500'
              : style.includes('rose')
              ? 'bg-rose-500'
              : style.includes('indigo')
              ? 'bg-indigo-500'
              : 'bg-slate-400'
          }`}
        />
      )}
      {children || status}
    </span>
  );
};

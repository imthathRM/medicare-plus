import React from 'react';

export const FormField = ({
  label,
  error,
  helperText,
  required = false,
  className = '',
  children,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] tracking-tight">
          {label} {required && <span className="text-[#B91C1C] dark:text-[#F87171] font-bold">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-[#B91C1C] dark:text-[#F87171] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#64748B] dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export const Input = React.forwardRef(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1E293B] border rounded-lg placeholder:text-[#64748B] dark:placeholder:text-slate-500 text-[#334155] dark:text-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 disabled:bg-[#F7F9FC] dark:disabled:bg-slate-800 disabled:text-[#64748B] dark:disabled:text-slate-500 ${
          error
            ? 'border-red-300 dark:border-red-800 focus:border-[#B91C1C] dark:focus:border-[#F87171] focus:ring-[#B91C1C]/20'
            : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#2563EB] dark:focus:border-[#60A5FA] focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20'
        } ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const Select = React.forwardRef(
  ({ error, children, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1E293B] border rounded-lg text-[#334155] dark:text-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 disabled:bg-[#F7F9FC] dark:disabled:bg-slate-800 disabled:text-[#64748B] dark:disabled:text-slate-500 ${
          error
            ? 'border-red-300 dark:border-red-800 focus:border-[#B91C1C] dark:focus:border-[#F87171] focus:ring-[#B91C1C]/20'
            : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#2563EB] dark:focus:border-[#60A5FA] focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef(
  ({ error, rows = 3, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1E293B] border rounded-lg placeholder:text-[#64748B] dark:placeholder:text-slate-500 text-[#334155] dark:text-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 disabled:bg-[#F7F9FC] dark:disabled:bg-slate-800 disabled:text-[#64748B] dark:disabled:text-slate-500 ${
          error
            ? 'border-red-300 dark:border-red-800 focus:border-[#B91C1C] dark:focus:border-[#F87171] focus:ring-[#B91C1C]/20'
            : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#2563EB] dark:focus:border-[#60A5FA] focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20'
        } ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

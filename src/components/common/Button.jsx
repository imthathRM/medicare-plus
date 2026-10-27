import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs focus:ring-[#2563EB] border border-transparent active:bg-[#1E40AF]',
    teal:
      'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-xs focus:ring-[#0F766E] border border-transparent active:bg-[#134E4A]',
    secondary:
      'bg-white dark:bg-[#1E293B] hover:bg-[#F7F9FC] dark:hover:bg-slate-700 text-[#334155] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#334155] shadow-xs focus:ring-[#2563EB] dark:focus:ring-[#60A5FA] active:bg-slate-100 dark:active:bg-slate-800',
    outline:
      'bg-transparent hover:bg-blue-50 dark:hover:bg-slate-800 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/50 focus:ring-[#2563EB] dark:focus:ring-[#60A5FA] active:bg-blue-100 dark:active:bg-slate-700',
    danger:
      'bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-xs focus:ring-[#B91C1C] border border-transparent active:bg-[#7F1D1D]',
    ghost:
      'bg-transparent hover:bg-[#F7F9FC] dark:hover:bg-slate-800 text-[#64748B] dark:text-[#CBD5E1] hover:text-[#334155] dark:hover:text-[#F1F5F9] focus:ring-slate-300 dark:focus:ring-slate-600 border border-transparent',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4 text-current" />
      ) : null}
      <span>{children}</span>
      {!isLoading && RightIcon ? <RightIcon className="w-4 h-4 text-current" /> : null}
    </button>
  );
};

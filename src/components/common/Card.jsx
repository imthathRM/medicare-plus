import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  headerIcon: Icon,
  className = '',
  bodyClassName = '',
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-[#E2E8F0] shadow-xs ${className}`}
    >
      {(title || subtitle || action || Icon) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-base font-semibold text-[#1E3A5F] truncate tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#64748B] mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? bodyClassName : `p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

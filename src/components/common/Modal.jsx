import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-full ${sizeClasses[size]} transform rounded-lg bg-white dark:bg-[#1E293B] text-left align-middle shadow-lg border border-[#E2E8F0] dark:border-[#334155] flex flex-col max-h-[90vh] transition-colors`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E2E8F0] dark:border-[#334155] px-6 py-5 shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">{title}</h3>
              {description && (
                <p className="mt-1 text-xs text-[#64748B] dark:text-[#CBD5E1] leading-normal">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#64748B] dark:text-[#CBD5E1] hover:text-[#334155] dark:hover:text-[#F1F5F9] p-1.5 rounded-lg hover:bg-[#F7F9FC] dark:hover:bg-slate-700 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 text-[#334155] dark:text-[#F1F5F9]">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-slate-800/90 px-6 py-4 rounded-b-lg shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

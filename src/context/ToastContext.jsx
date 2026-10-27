import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = (title, message) => addToast({ title, message, type: 'success' });
  const error = (title, message) => addToast({ title, message, type: 'error' });
  const info = (title, message) => addToast({ title, message, type: 'info' });
  const warning = (title, message) => addToast({ title, message, type: 'warning' });

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-md dark:shadow-slate-900/50 transition-colors bg-white dark:bg-[#1E293B] ${
              toast.type === 'success'
                ? 'border-emerald-200 dark:border-emerald-800/60 text-[#15803D] dark:text-[#4ADE80]'
                : toast.type === 'error'
                ? 'border-red-200 dark:border-rose-800/60 text-[#B91C1C] dark:text-[#F87171]'
                : toast.type === 'warning'
                ? 'border-amber-200 dark:border-amber-800/60 text-[#B45309] dark:text-[#FBBF24]'
                : 'border-blue-200 dark:border-blue-800/60 text-[#2563EB] dark:text-[#60A5FA]'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#15803D] dark:text-[#4ADE80]" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#B91C1C] dark:text-[#F87171]" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#B45309] dark:text-[#FBBF24]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight text-[#1E3A5F] dark:text-[#F1F5F9]">{toast.title}</h4>
              {toast.message && (
                <p className="mt-0.5 text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-[#64748B] hover:text-[#334155] dark:text-slate-400 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Cross, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100 shadow-sm">
        <Cross className="w-8 h-8 rotate-45 stroke-[2.5]" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="text-base font-semibold text-slate-700 mt-2">Hospital Page Not Found</p>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1">
        The clinical resource or hospital management section you requested does not exist or has been relocated.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={Home}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

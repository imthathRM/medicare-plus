import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Cross, Eye, EyeOff, ShieldAlert, Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { FormField, Input } from '../components/common/FormField';
import { validateEmail, validateRequired } from '../utils/validators';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, demoCredentials } = useAuth();

  const [email, setEmail] = useState('admin@medicare.plus');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const newErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    const pwdErr = validateRequired(password, 'Password');
    if (pwdErr) newErrors.password = pwdErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validate()) return;

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleUseDemo = (e) => {
    e.preventDefault();
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setErrors({});
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Healthcare Logo & Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 mb-4">
            <Cross className="w-8 h-8 rotate-45 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            MediCare <span className="text-sky-600">Plus</span>
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-xs">
            Hospital Management System & Clinical Administration Portal
          </p>
        </div>

        {/* Development Demo Notice */}
        <div className="mt-6 bg-sky-50 border border-sky-200/80 rounded-2xl p-4 text-xs text-sky-900 shadow-xs">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sky-950">Development Demonstration Mode</p>
              <p className="mt-0.5 text-sky-700 leading-relaxed">
                This is the frontend-only demonstration flow. Click below to autofill verified admin credentials.
              </p>
              <button
                type="button"
                onClick={handleUseDemo}
                className="mt-2 text-xs font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1 cursor-pointer"
              >
                Autofill demo credentials ({demoCredentials.email})
              </button>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="mt-6 bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-md">
          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email / Staff ID" required error={errors.email}>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@medicare.plus"
                  className="pl-10"
                  error={!!errors.email}
                />
              </div>
            </FormField>

            <FormField label="Password" required error={errors.password}>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  error={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#demo-help"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Demo system password is set to: password123');
                }}
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                Forgot password?
              </a>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                rightIcon={ArrowRight}
              >
                Sign In to MediCare Plus
              </Button>
            </div>
          </form>

          {/* Institutional Compliance Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              HIPAA & SLMC Compliant Healthcare Administration Software
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

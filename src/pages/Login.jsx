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
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Healthcare Logo & Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-lg bg-[#2563EB] dark:bg-blue-600 text-white flex items-center justify-center shadow-xs mb-4">
            <Cross className="w-8 h-8 rotate-45 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">
            MediCare <span className="text-[#2563EB] dark:text-[#60A5FA]">Plus</span>
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] max-w-xs">
            Hospital Management System & Clinical Administration Portal
          </p>
        </div>

        {/* Development Demo Notice */}
        <div className="mt-6 bg-blue-50/80 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-lg p-4 text-xs text-[#1E3A5F] dark:text-[#F1F5F9] shadow-xs">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">Development Demonstration Mode</p>
              <p className="mt-0.5 text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                This is the frontend-only demonstration flow. Click below to autofill verified admin credentials.
              </p>
              <button
                type="button"
                onClick={handleUseDemo}
                className="mt-2 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Autofill demo credentials ({demoCredentials.email})
              </button>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="mt-6 bg-white dark:bg-[#1E293B] py-8 px-6 sm:px-10 rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          {loginError && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/50 text-xs text-[#B91C1C] dark:text-[#F87171] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#B91C1C] dark:text-[#F87171] shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email / Staff ID" required error={errors.email}>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] dark:text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                <Lock className="w-4 h-4 text-[#64748B] dark:text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#CBD5E1] hover:text-[#334155] dark:hover:text-[#F1F5F9] p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#334155] dark:text-[#CBD5E1]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#E2E8F0] dark:border-[#334155]"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setPassword('password123');
                  setLoginError('Default demo password filled: password123');
                }}
                className="font-medium text-[#2563EB] dark:text-[#60A5FA] hover:underline"
              >
                Forgot password?
              </button>
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
          <div className="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#334155] text-center">
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              HIPAA & SLMC Compliant Healthcare Administration Software
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

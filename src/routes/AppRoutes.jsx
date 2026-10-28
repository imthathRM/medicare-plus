import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Patients } from '../pages/Patients';
import { Doctors } from '../pages/Doctors';
import { Departments } from '../pages/Departments';
import { Appointments } from '../pages/Appointments';
import { Admissions } from '../pages/Admissions';
import { Billing } from '../pages/Billing';
import { Pharmacy } from '../pages/Pharmacy';
import { Staff } from '../pages/Staff';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { NotFound } from '../pages/NotFound';

// Protected Route wrapper with session loading and RBAC support
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isInitialLoading, user } = useAuth();
  const location = useLocation();

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] dark:bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] font-medium">Verifying security session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user?.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    if (userRole !== 'ADMIN' && !normalizedAllowed.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export const AppRoutes = () => {
  const { isAuthenticated, isInitialLoading } = useAuth();

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] dark:bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] font-medium">Loading MediCare Plus...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Hospital Application Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="departments" element={<Departments />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="admissions" element={<Admissions />} />
        <Route
          path="billing"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR']}>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="pharmacy"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'DOCTOR']}>
              <Pharmacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

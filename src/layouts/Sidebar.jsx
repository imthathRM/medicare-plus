import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  CalendarCheck2,
  BedDouble,
  Receipt,
  Pill,
  UserCog,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Cross,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHospitalData } from '../context/HospitalDataContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users, badgeKey: 'patients' },
  { name: 'Doctors', path: '/doctors', icon: UserCheck },
  { name: 'Departments', path: '/departments', icon: Building2 },
  { name: 'Appointments', path: '/appointments', icon: CalendarCheck2, badgeKey: 'appointments' },
  { name: 'Admissions', path: '/admissions', icon: BedDouble, badgeKey: 'admissions' },
  { name: 'Billing', path: '/billing', icon: Receipt },
  { name: 'Pharmacy & Inventory', path: '/pharmacy', icon: Pill, badgeKey: 'lowStock' },
  { name: 'Staff', path: '/staff', icon: UserCog },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const { dashboardStats } = useHospitalData();

  const getBadgeValue = (key) => {
    if (key === 'appointments') return dashboardStats.todayAppointments;
    if (key === 'admissions') return dashboardStats.activeAdmissions;
    if (key === 'lowStock' && dashboardStats.lowStockCount > 0) return `${dashboardStats.lowStockCount}!`;
    return null;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-[#E2E8F0] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2E8F0] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Cross className="w-5 h-5 rotate-45 stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-[#1E3A5F] tracking-tight leading-none flex items-center gap-1">
                  MediCare <span className="text-[#2563EB]">Plus</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0F766E] mt-1">
                  Hospital System
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-[#64748B] hover:text-[#1E3A5F] hover:bg-[#F7F9FC] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const badge = item.badgeKey ? getBadgeValue(item.badgeKey) : null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                    isActive
                      ? 'bg-blue-50 text-[#2563EB] font-semibold'
                      : 'text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#1E3A5F]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#2563EB]'
                          : 'text-[#64748B] group-hover:text-[#1E3A5F]'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {!isCollapsed && badge && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          typeof badge === 'string' && badge.includes('!')
                            ? 'bg-red-50 text-[#B91C1C]'
                            : isActive
                            ? 'bg-blue-100 text-[#2563EB]'
                            : 'bg-[#F7F9FC] text-[#64748B] border border-[#E2E8F0]'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout in Footer */}
        <div className="p-3 border-t border-[#E2E8F0] shrink-0">
          <div
            className={`flex items-center gap-3 p-2 rounded-lg ${
              isCollapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2563EB] border border-[#E2E8F0] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                : 'MP'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#1E3A5F] truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  {user?.role || 'Hospital Admin'}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={logout}
                className="text-[#64748B] hover:text-[#B91C1C] p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Sign out of system"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

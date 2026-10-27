import React, { useState } from 'react';
import {
  Hospital,
  User,
  Sliders,
  ShieldCheck,
  Save,
  Sun,
  Moon,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { FormField, Input, Select } from '../components/common/FormField';

export const Settings = () => {
  const { hospitalProfile, updateHospitalProfile, appSettings, updateAppSettings, setGlobalThemeMode } = useHospitalData();
  const { user } = useAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState('hospital'); // 'hospital' | 'profile' | 'preferences'

  // Form states
  const [profileForm, setProfileForm] = useState({ ...hospitalProfile });
  const [settingsForm, setSettingsForm] = useState({ ...appSettings });
  const [userProfileForm, setUserProfileForm] = useState({
    name: user?.name || 'Dr. Senaka Weeraratne',
    email: user?.email || 'admin@medicare.plus',
    role: user?.role || 'Hospital Administrator',
    department: user?.department || 'Executive Administration',
  });

  const isAdmin =
    !user ||
    user.role === 'Hospital Administrator' ||
    user.role === 'Superadmin' ||
    user.role === 'admin';

  const handleThemeSelect = (mode) => {
    if (!isAdmin) return;
    setSettingsForm((prev) => ({ ...prev, themeMode: mode }));
    setGlobalThemeMode(mode);
  };

  const handleSaveHospital = (e) => {
    e.preventDefault();
    updateHospitalProfile(profileForm);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    updateAppSettings(settingsForm);
  };

  const handleSaveUserProfile = (e) => {
    e.preventDefault();
    success('Profile Updated', 'Administrator profile details saved in current session.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">System Settings & Configurations</h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-0.5">
          Configure hospital institutional profile, administrative preferences, and clinical defaults
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#334155]">
        <button
          onClick={() => setActiveTab('hospital')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'hospital'
              ? 'border-[#2563EB] dark:border-[#60A5FA] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#64748B] dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <Hospital className="w-4 h-4" />
          Hospital Profile
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-[#2563EB] dark:border-[#60A5FA] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#64748B] dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <User className="w-4 h-4" />
          Admin User Profile
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'preferences'
              ? 'border-[#2563EB] dark:border-[#60A5FA] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#64748B] dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Application Preferences
        </button>
      </div>

      {/* TAB 1: Hospital Profile */}
      {activeTab === 'hospital' && (
        <form onSubmit={handleSaveHospital} className="space-y-6">
          <Card
            title="Institutional Information"
            subtitle="Details printed on patient bills, laboratory summaries, and clinical reports"
            action={
              <Button type="submit" variant="primary" leftIcon={Save} size="sm">
                Save Profile Changes
              </Button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Hospital Name" required>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </FormField>

              <FormField label="Institutional Tagline">
                <Input
                  value={profileForm.tagline}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                />
              </FormField>

              <FormField label="SLMC / Ministry Registration Number">
                <Input
                  value={profileForm.registrationNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, registrationNumber: e.target.value })}
                />
              </FormField>

              <FormField label="Tax Identification (TIN)">
                <Input
                  value={profileForm.taxId}
                  onChange={(e) => setProfileForm({ ...profileForm, taxId: e.target.value })}
                />
              </FormField>

              <FormField label="Hospital General Hotline">
                <Input
                  value={profileForm.hotline}
                  onChange={(e) => setProfileForm({ ...profileForm, hotline: e.target.value })}
                />
              </FormField>

              <FormField label="Emergency Trauma Line">
                <Input
                  value={profileForm.emergencyLine}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyLine: e.target.value })}
                />
              </FormField>

              <FormField label="Official Inquiries Email">
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </FormField>

              <FormField label="Billing Inquiries Email">
                <Input
                  type="email"
                  value={profileForm.billingEmail}
                  onChange={(e) => setProfileForm({ ...profileForm, billingEmail: e.target.value })}
                />
              </FormField>

              <FormField label="Physical Hospital Address" className="md:col-span-2">
                <Input
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                />
              </FormField>

              <FormField label="Accreditations & Certifications" className="md:col-span-2">
                <Input
                  value={profileForm.accreditation}
                  onChange={(e) => setProfileForm({ ...profileForm, accreditation: e.target.value })}
                />
              </FormField>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 2: User Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveUserProfile} className="space-y-6">
          <Card
            title="Administrator Credentials"
            subtitle="Current authenticated administrator account in session"
            action={
              <Button type="submit" variant="primary" leftIcon={Save} size="sm">
                Save User Profile
              </Button>
            }
          >
            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50/70 dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 mb-6">
              <div className="w-16 h-16 rounded-lg bg-[#2563EB] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                SW
              </div>
              <div>
                <h4 className="font-bold text-[#1E3A5F] dark:text-[#F1F5F9] text-base">{userProfileForm.name}</h4>
                <p className="text-xs text-[#64748B] dark:text-[#CBD5E1]">{userProfileForm.role}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-[#4ADE80] text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Full System Superadmin Rights
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Display Name" required>
                <Input
                  value={userProfileForm.name}
                  onChange={(e) => setUserProfileForm({ ...userProfileForm, name: e.target.value })}
                />
              </FormField>

              <FormField label="Administrative Email" required>
                <Input
                  type="email"
                  value={userProfileForm.email}
                  onChange={(e) => setUserProfileForm({ ...userProfileForm, email: e.target.value })}
                />
              </FormField>

              <FormField label="Designation / Role">
                <Input
                  value={userProfileForm.role}
                  onChange={(e) => setUserProfileForm({ ...userProfileForm, role: e.target.value })}
                />
              </FormField>

              <FormField label="Administrative Department">
                <Input
                  value={userProfileForm.department}
                  onChange={(e) => setUserProfileForm({ ...userProfileForm, department: e.target.value })}
                />
              </FormField>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 3: Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="space-y-6">
          {/* Global Theme Settings Card */}
          <Card
            title="Hospital-Wide Global Theme"
            subtitle="Central administrative appearance control across all consoles and user roles"
            headerIcon={Sliders}
          >
            <div className="space-y-4">
              <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] leading-relaxed">
                As the Hospital Administrator, you control the theme for the entire MediCare Plus hospital network.
                When you switch between Light and Dark mode, the setting takes effect immediately across all clinical workstations, nursing stations, doctor consultation suites, pharmacy desks, and administrative consoles. Individual users do not have overriding theme settings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Light Theme Card */}
                <div
                  onClick={() => handleThemeSelect('light')}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    settingsForm.themeMode === 'light'
                      ? 'border-[#2563EB] bg-blue-50/40 dark:bg-slate-700/60 ring-2 ring-[#2563EB]/20'
                      : 'border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                          Professional Light Theme
                        </h4>
                        <input
                          type="radio"
                          name="globalThemeMode"
                          value="light"
                          checked={settingsForm.themeMode === 'light'}
                          onChange={() => handleThemeSelect('light')}
                          className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]"
                        />
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] mt-1">
                        High clarity medical daylight palette. White panels (#FFFFFF), soft background (#F7F9FC), and deep navy headings (#1E3A5F).
                      </p>
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#F7F9FC] border border-slate-300 inline-block" title="Background" />
                        <span className="w-4 h-4 rounded-full bg-[#FFFFFF] border border-slate-300 inline-block" title="Panel" />
                        <span className="w-4 h-4 rounded-full bg-[#2563EB] inline-block" title="Primary Blue" />
                        <span className="w-4 h-4 rounded-full bg-[#0F766E] inline-block" title="Teal Accent" />
                        <span className="w-4 h-4 rounded-full bg-[#1E3A5F] inline-block" title="Heading" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dark Theme Card */}
                <div
                  onClick={() => handleThemeSelect('dark')}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    settingsForm.themeMode === 'dark'
                      ? 'border-[#60A5FA] bg-blue-950/20 dark:bg-slate-700/60 ring-2 ring-[#60A5FA]/20'
                      : 'border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-950/60 text-[#60A5FA] flex items-center justify-center shrink-0 border border-blue-800/40">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                          Clinical Dark Theme
                        </h4>
                        <input
                          type="radio"
                          name="globalThemeMode"
                          value="dark"
                          checked={settingsForm.themeMode === 'dark'}
                          onChange={() => handleThemeSelect('dark')}
                          className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]"
                        />
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] mt-1">
                        Reduced-glare nocturnal palette. Slate background (#0F172A), dark cards (#1E293B), sidebar (#111827), and soft blue accent (#60A5FA).
                      </p>
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#0F172A] border border-slate-700 inline-block" title="Background" />
                        <span className="w-4 h-4 rounded-full bg-[#111827] border border-slate-700 inline-block" title="Sidebar" />
                        <span className="w-4 h-4 rounded-full bg-[#1E293B] border border-slate-700 inline-block" title="Panel" />
                        <span className="w-4 h-4 rounded-full bg-[#60A5FA] inline-block" title="Accent Blue" />
                        <span className="w-4 h-4 rounded-full bg-[#4ADE80] inline-block" title="Success" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="Hospital System Preferences"
            subtitle="Localization, operational defaults, and notifications"
            action={
              <Button type="submit" variant="primary" leftIcon={Save} size="sm">
                Save Preferences
              </Button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Default Financial Currency">
                <Select
                  value={settingsForm.defaultCurrency}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultCurrency: e.target.value })}
                  disabled
                >
                  <option value="LKR">Sri Lankan Rupee (LKR)</option>
                </Select>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Locked to LKR as per system specification.</span>
              </FormField>

              <FormField label="Date Format">
                <Select
                  value={settingsForm.dateFormat}
                  onChange={(e) => setSettingsForm({ ...settingsForm, dateFormat: e.target.value })}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Standard Sri Lankan format)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                </Select>
              </FormField>

              <FormField label="Standard Appointment Slot (Minutes)">
                <Input
                  type="number"
                  value={settingsForm.defaultAppointmentDurationMinutes}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      defaultAppointmentDurationMinutes: Number(e.target.value),
                    })
                  }
                />
              </FormField>

              <FormField label="Pharmacy Low Stock Reorder Threshold">
                <Input
                  type="number"
                  value={settingsForm.lowStockAlertThreshold}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      lowStockAlertThreshold: Number(e.target.value),
                    })
                  }
                />
              </FormField>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#334155] space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.enableSmsReminders}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, enableSmsReminders: e.target.checked })
                  }
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-600 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-700 dark:text-[#CBD5E1] font-medium">
                  Enable automated SMS reminders to patients 24 hours prior to scheduled consultation
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.enableEmailInvoicing}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, enableEmailInvoicing: e.target.checked })
                  }
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-600 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-700 dark:text-[#CBD5E1] font-medium">
                  Automatically dispatch PDF billing receipt copy to patient email upon payment settlement
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.autoDischargeSummary}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, autoDischargeSummary: e.target.checked })
                  }
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-600 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-700 dark:text-[#CBD5E1] font-medium">
                  Auto-generate electronic discharge summary card upon inpatient status change
                </span>
              </label>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};

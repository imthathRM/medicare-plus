import React, { useState } from 'react';
import {
  Hospital,
  User,
  Sliders,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { FormField, Input, Select } from '../components/common/FormField';

export const Settings = () => {
  const { hospitalProfile, updateHospitalProfile, appSettings, updateAppSettings } = useHospitalData();
  const { user } = useAuth();

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
    alert('Administrator profile credentials updated in session.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Configurations</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure hospital institutional profile, administrative preferences, and clinical defaults
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('hospital')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'hospital'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Hospital className="w-4 h-4" />
          Hospital Profile
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          Admin User Profile
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'preferences'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
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
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-100 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                SW
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{userProfileForm.name}</h4>
                <p className="text-xs text-slate-600">{userProfileForm.role}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
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
                <span className="text-[11px] text-slate-400">Locked to LKR as per system specification.</span>
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

            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.enableSmsReminders}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, enableSmsReminders: e.target.checked })
                  }
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-700 font-medium">
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
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-700 font-medium">
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
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-700 font-medium">
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

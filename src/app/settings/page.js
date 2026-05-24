'use client';

import PageShell from '@/components/crm/PageShell';
import SectionCard from '@/components/crm/SectionCard';
import ActionButton from '@/components/crm/ActionButton';
import { User, Bell, Sliders, Save } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    fullName: 'Muhammad Israr',
    email: 'muhammad.israr@leadsrift.com',
    role: 'Agent',
    notifications: {
      leadAssigned: true,
      meetingReminder: true,
      callAlert: true,
      dailySummary: true
    },
    preferences: {
      theme: 'Dark Cyber',
      autoRefresh: true,
      soundNotification: true
    }
  });

  const handleToggle = (section, key) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
  };

  return (
    <PageShell title="Settings" subtitle="Manage your profile and preferences">
      {/* Profile Section */}
      <SectionCard
        title="Profile"
        subtitle="Your account information"
        className="mb-6 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border-cyan-500/30"
      >
        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6 pb-6 border-b border-cyan-500/10">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
              MI
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={settings.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/20 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/20 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Role
            </label>
            <select
              value={settings.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/20 text-slate-200"
            >
              <option>Agent</option>
              <option>Team Lead</option>
              <option>Operations Manager</option>
              <option>Admin</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Notification Settings */}
      <SectionCard
        title="Notifications"
        subtitle="Control how you receive updates"
        className="mb-6"
      >
        <div className="space-y-4">
          {[
            {
              key: 'leadAssigned',
              label: 'New Lead Assigned',
              desc: 'Get notified when a new lead is assigned to you'
            },
            {
              key: 'meetingReminder',
              label: 'Meeting Reminders',
              desc: 'Receive reminders before scheduled meetings'
            },
            {
              key: 'callAlert',
              label: 'Call Alerts',
              desc: 'Get notified for important call events'
            },
            {
              key: 'dailySummary',
              label: 'Daily Summary',
              desc: 'Receive a daily summary of your activities'
            }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/20 border border-slate-700/30 hover:border-cyan-500/20 transition-all duration-200"
            >
              <div>
                <p className="font-medium text-slate-300">{item.label}</p>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key]}
                  onChange={() => handleToggle('notifications', item.key)}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6 rounded-full border transition-colors duration-200 ${
                    settings.notifications[item.key]
                      ? 'bg-cyan-600 border-cyan-500'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white m-0.5 transition-transform duration-200 ${
                      settings.notifications[item.key] ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Preferences */}
      <SectionCard
        title="CRM Preferences"
        subtitle="Customize your experience"
        className="mb-6"
      >
        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Theme
            </label>
            <select
              value={settings.preferences.theme}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  preferences: { ...prev.preferences, theme: e.target.value }
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/20 text-slate-200"
            >
              <option>Dark Cyber</option>
              <option>Light Modern</option>
              <option>Night Mode</option>
              <option>High Contrast</option>
            </select>
          </div>

          {/* Other Preferences */}
          <div className="space-y-3 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/20 transition-colors">
              <div>
                <p className="font-medium text-slate-300">Auto Refresh</p>
                <p className="text-xs text-slate-500">Automatically refresh data</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preferences.autoRefresh}
                  onChange={() => handleToggle('preferences', 'autoRefresh')}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6 rounded-full border transition-colors duration-200 ${
                    settings.preferences.autoRefresh
                      ? 'bg-cyan-600 border-cyan-500'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white m-0.5 transition-transform duration-200 ${
                      settings.preferences.autoRefresh ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/20 transition-colors">
              <div>
                <p className="font-medium text-slate-300">Sound Notifications</p>
                <p className="text-xs text-slate-500">Play sounds for alerts</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preferences.soundNotification}
                  onChange={() => handleToggle('preferences', 'soundNotification')}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6 rounded-full border transition-colors duration-200 ${
                    settings.preferences.soundNotification
                      ? 'bg-cyan-600 border-cyan-500'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white m-0.5 transition-transform duration-200 ${
                      settings.preferences.soundNotification ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <ActionButton variant="secondary">Cancel</ActionButton>
        <ActionButton variant="primary" icon={Save} onClick={handleSave}>
          Save Changes
        </ActionButton>
      </div>
    </PageShell>
  );
}

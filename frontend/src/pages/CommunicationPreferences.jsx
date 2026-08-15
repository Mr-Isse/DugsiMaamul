import React, { useState } from 'react';
import {
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  Save
} from 'lucide-react';
import {
  useGetUserCommunicationPreferencesQuery,
  useUpdateUserCommunicationPreferencesMutation
} from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';

const CommunicationPreferences = () => {
  const { data: preferences, isLoading } = useGetUserCommunicationPreferencesQuery();
  const [updatePreferences] = useUpdateUserCommunicationPreferencesMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences || {
    email: { enabled: true, allowMarketing: false },
    push: { enabled: true, allowMarketing: false },
    inApp: { enabled: true },
    categoryPreferences: {
      attendance: { email: true, push: true },
      fees: { email: true, push: true },
      exams: { email: true, push: true },
      announcements: { email: true, push: true },
      emergencies: { email: true, push: true }
    }
  });

  React.useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(localPreferences).unwrap();
      toast.success('Preferences updated');
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleChannel = (channel, field = 'enabled') => {
    setLocalPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [field]: !prev[channel]?.[field]
      }
    }));
  };

  const toggleCategory = (category, channel) => {
    setLocalPreferences(prev => ({
      ...prev,
      categoryPreferences: {
        ...prev.categoryPreferences,
        [category]: {
          ...prev.categoryPreferences?.[category],
          [channel]: !prev.categoryPreferences?.[category]?.[channel]
        }
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const channels = [
    { name: 'Email', key: 'email', icon: Mail, description: 'Receive communications via email' },
    { name: 'Push Notifications', key: 'push', icon: Bell, description: 'Receive push notifications on your device' }
  ];

  const categories = [
    { name: 'Attendance Alerts', key: 'attendance', description: 'Alerts about student attendance' },
    { name: 'Fee Reminders', key: 'fees', description: 'Reminders about fee payments' },
    { name: 'Exam Updates', key: 'exams', description: 'Exam schedules and results' },
    { name: 'Announcements', key: 'announcements', description: 'School announcements' },
    { name: 'Emergency Alerts', key: 'emergencies', description: 'Emergency notifications' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Communication Preferences
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Choose how you want to receive communications
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : <><Save size={16} /> Save Preferences</>}
        </button>
      </div>

      {/* Channel Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Settings size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Communication Channels
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {channels.map(({ name, key, icon: Icon, description }) => (
            <div key={key} className="flex items-start justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-900/30">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Icon size={24} className="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
                  <input
                    type="checkbox"
                    checked={localPreferences[key]?.enabled ?? true}
                    onChange={() => toggleChannel(key, 'enabled')}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                {key !== 'push' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Marketing</span>
                    <input
                      type="checkbox"
                      checked={localPreferences[key]?.allowMarketing ?? false}
                      onChange={() => toggleChannel(key, 'allowMarketing')}
                      disabled={!localPreferences[key]?.enabled}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <Bell size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Notification Categories
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Push</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(({ name, key, description }) => (
                  <tr key={key} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                      </div>
                    </td>
                    {['email', 'push'].map(channel => (
                      <td key={channel} className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={localPreferences.categoryPreferences?.[key]?.[channel] ?? true}
                          onChange={() => toggleCategory(key, channel)}
                          disabled={!localPreferences[channel]?.enabled}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationPreferences;

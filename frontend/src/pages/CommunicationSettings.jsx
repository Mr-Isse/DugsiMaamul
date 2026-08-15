import { useState, useEffect } from 'react';
import {
  Save,
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  Settings,
  Loader2,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingsMutation,
  useUpsertChannelProviderMutation,
  useDeleteChannelProviderMutation
} from '../store/adminApiSlice';

/* ── Reusable input field ─────────────────────────────────────── */
const Field = ({ label, icon: Icon, id, type, value, onChange, placeholder, hint, error }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
    >
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={16} className="text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <input
        id={id}
        type={type || 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          'w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg',
          'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
          error
            ? 'ring-2 ring-red-500 border-red-500'
            : 'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
          'placeholder-gray-400 transition-all text-sm',
        ].join(' ')}
      />
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">{error}</p>
    )}
    {hint && !error && (
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
    )}
  </div>
);

/* ── Password field with toggle ─────────────────────────────────────── */
const PasswordField = ({ label, id, value, onChange, placeholder, hint }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={[
            'w-full pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg',
            'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            'placeholder-gray-400 transition-all text-sm',
          ].join(' ')}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
};

/* ── Select field ─────────────────────────────────────── */
const Select = ({ label, id, value, onChange, options, placeholder }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
    >
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={[
        'w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg',
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
        'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
        'text-sm',
      ].join(' ')}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

/* ── Page ─────────────────────────────────────────────────────── */
const CommunicationSettings = () => {
  const { data: commData, isLoading } = useGetCommunicationSettingsQuery();
  const [updateSettings, { isLoading: isSavingSettings }] = useUpdateCommunicationSettingsMutation();
  const [upsertProvider, { isLoading: isSavingProvider }] = useUpsertChannelProviderMutation();
  const [deleteProvider] = useDeleteChannelProviderMutation();

  const [settings, setSettings] = useState({});
  const [providers, setProviders] = useState([]);
  const [newProvider, setNewProvider] = useState({
    providerType: '',
    providerKey: '',
    config: {}
  });
  const [showAddProvider, setShowAddProvider] = useState(false);

  useEffect(() => {
    if (commData) {
      setSettings(commData.settings || {});
      setProviders(commData.providers || []);
    }
  }, [commData]);

  const set = (key) => (e) =>
    setSettings((prev) => ({ ...prev, [key]: e.target.value }));

  const setProviderConfig = (key) => (e) =>
    setNewProvider((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: e.target.value }
    }));

  const handleSaveSettings = async () => {
    try {
      await updateSettings({ settings }).unwrap();
      toast.success('Communication settings saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleAddProvider = async () => {
    if (!newProvider.providerKey || !newProvider.providerType) {
      toast.error('Please fill in provider details');
      return;
    }
    try {
      await upsertProvider(newProvider).unwrap();
      setShowAddProvider(false);
      setNewProvider({ providerType: '', providerKey: '', config: {} });
      toast.success('Provider added!');
    } catch (err) {
      toast.error('Failed to add provider');
    }
  };

  const handleDeleteProvider = async (id) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      await deleteProvider(id).unwrap();
      toast.success('Provider deleted!');
    } catch (err) {
      toast.error('Failed to delete provider');
    }
  };

  const providerOptions = [
    { value: 'email', label: 'Email' },
    { value: 'push', label: 'Push Notifications' }
  ];



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="space-y-6"><div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /><div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Communication Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
            Configure your school's communication channels (Email, SMS, WhatsApp, Push)
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSavingSettings}
          className={[
            'flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl',
            'font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95',
            'transition-all disabled:opacity-60 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSavingSettings ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* ── General Settings card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <Settings size={18} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">General Settings</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Default communication preferences</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Default Email Sender Name"
            icon={Mail}
            id="email-sender-name"
            value={settings.emailSenderName || ''}
            onChange={set('emailSenderName')}
            placeholder="Your School Name"
            hint="Appears as the sender in emails"
          />
          <Field
            label="Default Email Sender Address"
            icon={Mail}
            id="email-sender-address"
            type="email"
            value={settings.emailSenderAddress || ''}
            onChange={set('emailSenderAddress')}
            placeholder="noreply@school.edu"
          />
        </div>
      </div>

      {/* ── Channel Providers card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Bell size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Channel Providers</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Configure providers for SMS, WhatsApp, etc.</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddProvider(!showAddProvider)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold text-sm hover:bg-primary/20 transition-colors"
          >
            <Plus size={16} />
            Add Provider
          </button>
        </div>

        <div className="p-6">
          {/* Add provider form */}
          {showAddProvider && (
            <div className="mb-6 p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-700/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Select
                  label="Provider Type"
                  id="provider-type"
                  value={newProvider.providerType}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, providerType: e.target.value }))}
                  options={providerOptions}
                  placeholder="Select type"
                />
                <Field
                  label="Provider Key"
                  id="provider-key"
                  value={newProvider.providerKey}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, providerKey: e.target.value }))}
                  placeholder="e.g. fcm, nodemailer"
                />
              </div>

              {newProvider.providerType === 'email' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field
                    label="SMTP Host"
                    id="smtp-host"
                    value={newProvider.config.host || ''}
                    onChange={setProviderConfig('host')}
                    placeholder="smtp.gmail.com"
                  />
                  <Field
                    label="SMTP Port"
                    id="smtp-port"
                    type="number"
                    value={newProvider.config.port || ''}
                    onChange={setProviderConfig('port')}
                    placeholder="587"
                  />
                  <Field
                    label="SMTP Username"
                    id="smtp-user"
                    value={newProvider.config.user || ''}
                    onChange={setProviderConfig('user')}
                    placeholder="your@email.com"
                  />
                  <PasswordField
                    label="SMTP Password"
                    id="smtp-pass"
                    value={newProvider.config.pass || ''}
                    onChange={setProviderConfig('pass')}
                    placeholder="Your password"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleAddProvider}
                  disabled={isSavingProvider}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  {isSavingProvider ? 'Adding...' : 'Add Provider'}
                </button>
                <button
                  onClick={() => setShowAddProvider(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Providers list */}
          <div className="space-y-3">
            {providers.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No providers configured yet. Add one to get started.
              </p>
            ) : (
              providers.map((provider) => (
                <div key={provider._id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-700/30">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {provider.providerKey}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Type: {provider.providerType}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteProvider(provider._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationSettings;

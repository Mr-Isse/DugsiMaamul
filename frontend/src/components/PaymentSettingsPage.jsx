import { useState } from 'react';
import {
  Settings,
  CreditCard,
  Save,
  CheckCircle,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Activity,
  Info,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { 
  useGetPaymentProvidersQuery, 
  useGetPaymentSettingsQuery, 
  useSavePaymentSettingsMutation,
  useTestWaafiPayConnectionMutation
} from '../store/apiSlice';
import { toast } from 'sonner';

const PROVIDER_CONFIGS = {
  EVC_PLUS: {
    name: 'EVC Plus',
    description: 'Popular mobile money service',
    fields: [
      { name: 'merchantName', label: 'Merchant Name', type: 'text' },
      { name: 'merchantNumber', label: 'Merchant Number', type: 'text' },
      { name: 'merchantId', label: 'Merchant ID', type: 'text' },
      { name: 'apiKey', label: 'API Key', type: 'password' },
      { name: 'secretKey', label: 'Secret Key', type: 'password' },
      { name: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
      { name: 'callbackUrl', label: 'Callback URL', type: 'text' }
    ]
  },
  ZAAD: {
    name: 'Zaad',
    description: 'Mobile money payment solution',
    fields: [
      { name: 'merchantName', label: 'Merchant Name', type: 'text' },
      { name: 'merchantNumber', label: 'Merchant Number', type: 'text' },
      { name: 'merchantId', label: 'Merchant ID', type: 'text' },
      { name: 'apiKey', label: 'API Key', type: 'password' },
      { name: 'secretKey', label: 'Secret Key', type: 'password' },
      { name: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
      { name: 'callbackUrl', label: 'Callback URL', type: 'text' }
    ]
  },
  SAHAL: {
    name: 'Sahal',
    description: 'Sahal payment gateway',
    fields: [
      { name: 'merchantName', label: 'Merchant Name', type: 'text' },
      { name: 'merchantNumber', label: 'Merchant Number', type: 'text' },
      { name: 'merchantId', label: 'Merchant ID', type: 'text' },
      { name: 'apiKey', label: 'API Key', type: 'password' },
      { name: 'secretKey', label: 'Secret Key', type: 'password' },
      { name: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
      { name: 'callbackUrl', label: 'Callback URL', type: 'text' }
    ]
  },
  SALAAM_BANK: {
    name: 'Salaam Bank',
    description: 'Salaam Bank payment integration',
    fields: [
      { name: 'merchantName', label: 'Merchant Name', type: 'text' },
      { name: 'merchantId', label: 'Merchant ID', type: 'text' },
      { name: 'clientId', label: 'Client ID', type: 'text' },
      { name: 'clientSecret', label: 'Client Secret', type: 'password' },
      { name: 'apiKey', label: 'API Key', type: 'password' },
      { name: 'secretKey', label: 'Secret Key', type: 'password' },
      { name: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
      { name: 'callbackUrl', label: 'Callback URL', type: 'text' }
    ]
  },
  PREMIER_BANK: {
    name: 'Premier Bank',
    description: 'Premier Bank payment services',
    fields: [
      { name: 'merchantName', label: 'Merchant Name', type: 'text' },
      { name: 'merchantId', label: 'Merchant ID', type: 'text' },
      { name: 'clientId', label: 'Client ID', type: 'text' },
      { name: 'clientSecret', label: 'Client Secret', type: 'password' },
      { name: 'apiKey', label: 'API Key', type: 'password' },
      { name: 'secretKey', label: 'Secret Key', type: 'password' },
      { name: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
      { name: 'callbackUrl', label: 'Callback URL', type: 'text' }
    ]
  },
  WAAFIPAY: {
    name: 'WaafiPay',
    description: 'WaafiPay Enterprise Payment Gateway',
    fields: [
      { name: 'merchantUid', label: 'Merchant UID', type: 'text', description: 'Enter the Merchant UID provided by WaafiPay.', example: 'M400394', required: true },
      { name: 'apiUserId', label: 'API User ID', type: 'text', description: 'Enter the API User ID assigned to your merchant account.', example: 'API-123456', required: true },
      { name: 'apiKey', label: 'API Key', type: 'password', description: 'Enter the API Key exactly as provided by WaafiPay.', required: true, isSecret: true },
      { name: 'storeId', label: 'Store ID', type: 'text', description: 'Enter the Store ID assigned by WaafiPay.', example: 'STORE_123', required: true },
      { name: 'hppKey', label: 'HPP Key', type: 'password', description: 'Enter your Hosted Payment Page (HPP) Key.', required: true, isSecret: true },
      { name: 'webhookSecret', label: 'Webhook Secret', type: 'password', description: 'Enter the Webhook Secret received after registering your webhook.', required: true, isSecret: true },
      { name: 'currency', label: 'Currency', type: 'text', description: 'Currency code for transactions.', example: 'USD', required: true }
    ]
  }
};

const PaymentSettingsPage = () => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [formData, setFormData] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [environment, setEnvironment] = useState('SANDBOX');
  const [isDefault, setIsDefault] = useState(false);
  
  const { data: providers, isLoading: providersLoading } = useGetPaymentProvidersQuery();
  const { data, refetch: refetchSettings } = useGetPaymentSettingsQuery(selectedProvider);
  const existingSettings = data?.settings;
  const [saveSettings, { isLoading: saving }] = useSavePaymentSettingsMutation();
  const [testConnection, { isLoading: testing }] = useTestWaafiPayConnectionMutation();

  const [connectionTested, setConnectionTested] = useState(false);
  const [replacingSecrets, setReplacingSecrets] = useState({});

  const WEBHOOK_URL = 'https://schoolmangementbackend-deployment.up.railway.app/api/v1/payments/waafipay/webhook';

  // Load existing settings when provider is selected
  useState(() => {
    if (existingSettings && selectedProvider) {
      const settings = Array.isArray(existingSettings) 
        ? existingSettings.find(s => s.provider === selectedProvider)
        : existingSettings;
      
      if (settings) {
        setFormData(settings);
        setEnvironment(settings.environment || 'SANDBOX');
        setIsDefault(settings.isDefault || false);
        setConnectionTested(true); // If it exists, assume it was tested previously
        setReplacingSecrets({});
      } else {
        setFormData({});
        setConnectionTested(false);
        setReplacingSecrets({});
      }
    }
  }, [existingSettings, selectedProvider]);

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setConnectionTested(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleReplaceSecret = (field) => {
    setReplacingSecrets(prev => ({ ...prev, [field]: true }));
    setFormData(prev => ({ ...prev, [field]: '' }));
    setConnectionTested(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setConnectionTested(false);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateFields = () => {
    const config = PROVIDER_CONFIGS[selectedProvider];
    if (!config) return false;

    for (const field of config.fields) {
      if (field.required) {
        // If it's a secret and we are not replacing it, it might be masked. We assume it's valid if it exists.
        const val = formData[field.name];
        if (!val || val.trim() === '') {
          toast.error(`${field.label} is required.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!selectedProvider) {
      toast.error('Please select a payment provider first');
      return;
    }

    if (!validateFields()) return;

    if (selectedProvider === 'WAAFIPAY' && !connectionTested) {
      toast.error('Please test the connection successfully before saving.');
      return;
    }

    try {
      await saveSettings({
        provider: selectedProvider,
        ...formData,
        environment,
        isDefault,
        isActive: true
      }).unwrap();
      
      toast.success('Payment settings saved successfully!');
      refetchSettings();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save settings');
    }
  };

  const handleTestConnection = async () => {
    if (selectedProvider !== 'WAAFIPAY') return;
    
    if (!validateFields()) return;
    
    try {
      const payload = {
        credentials: {
          provider: selectedProvider,
          ...formData,
          environment
        }
      };
      const res = await testConnection(payload).unwrap();
      if (res.success) {
        toast.success(res.message || 'Connection successful!');
        setConnectionTested(true);
      } else {
        toast.error(res.message || 'Connection failed.');
        setConnectionTested(false);
      }
    } catch (error) {
      toast.error(error.data?.message || error.message || 'Connection test failed');
      setConnectionTested(false);
    }
  };

  const providerList = providers?.providers || Object.keys(PROVIDER_CONFIGS);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your payment providers and settings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <Shield size={18} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Secure</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Provider Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Select Provider</h2>
            {providersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {providerList.map(providerKey => {
                  const config = PROVIDER_CONFIGS[providerKey];
                  const isActive = existingSettings && (
                    (Array.isArray(existingSettings) 
                      ? existingSettings.some(s => s.provider === providerKey && s.isActive)
                      : existingSettings?.provider === providerKey && existingSettings?.isActive)
                  );
                  
                  return (
                    <button
                      key={providerKey}
                      onClick={() => handleProviderSelect(providerKey)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedProvider === providerKey
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{config?.name || providerKey}</span>
                        {isActive && (
                          <CheckCircle size={16} className="text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{config?.description}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-2">
          {selectedProvider ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Settings size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {PROVIDER_CONFIGS[selectedProvider]?.name} Configuration
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {PROVIDER_CONFIGS[selectedProvider]?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Environment Toggle */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 block">Environment</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEnvironment('SANDBOX')}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                      environment === 'SANDBOX'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Sandbox
                  </button>
                  <button
                    onClick={() => setEnvironment('PRODUCTION')}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                      environment === 'PRODUCTION'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Production
                  </button>
                </div>
              </div>

              {/* Default Provider Toggle */}
              <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Set as Default Provider</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This provider will be used by default for payments</p>
                </div>
                <button
                  onClick={() => setIsDefault(!isDefault)}
                  className={`w-14 h-7 rounded-full transition-all relative ${
                    isDefault ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    isDefault ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {PROVIDER_CONFIGS[selectedProvider]?.fields.map(field => {
                  const isMaskedSecret = field.isSecret && formData[field.name]?.includes('***') && !replacingSecrets[field.name];

                  return (
                    <div key={field.name} className="bg-white dark:bg-gray-800 rounded-xl">
                      <div className="mb-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{field.description}</p>
                        )}
                        {field.example && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">Example: {field.example}</p>
                        )}
                      </div>
                      <div className="relative">
                        {isMaskedSecret ? (
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400">
                            <span>{formData[field.name]}</span>
                            <button
                              type="button"
                              onClick={() => handleReplaceSecret(field.name)}
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Replace Credential
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type={showPasswords[field.name] ? 'text' : field.type}
                              value={formData[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              placeholder={field.example ? `e.g. ${field.example}` : `Enter ${field.label.toLowerCase()}`}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                            {field.type === 'password' && (
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(field.name)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords[field.name] ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {field.isSecret && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
                          <Lock size={10} /> This value is encrypted securely after saving.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Webhook URL Section (WaafiPay Specific) */}
              {selectedProvider === 'WAAFIPAY' && (
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-2">
                      <Info size={16} /> Webhook Configuration
                    </h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-4">
                      Register this URL with WaafiPay to receive automatic payment notifications. 
                      It is automatically generated and should not be modified.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={WEBHOOK_URL}
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm font-mono text-gray-600 dark:text-gray-300 outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(WEBHOOK_URL)}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center shrink-0"
                        title="Copy to clipboard"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>

                  {(!formData.webhookSecret || formData.webhookSecret.trim() === '') && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex gap-3">
                      <AlertTriangle size={20} className="text-red-600 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-red-800 dark:text-red-400">Webhook Secret Missing</p>
                        <p className="text-red-700 dark:text-red-300 mt-1">
                          Webhook has not been registered yet. Register your webhook with WaafiPay to receive payment notifications and obtain the Webhook Secret.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* User Guidance Panel */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Setup Guide</h3>
                    <ol className="list-decimal pl-4 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                      <li>Obtain <strong>Merchant UID</strong> from WaafiPay.</li>
                      <li>Obtain <strong>API User ID</strong>.</li>
                      <li>Obtain <strong>API Key</strong>.</li>
                      <li>Obtain <strong>Store ID</strong>.</li>
                      <li>Obtain <strong>HPP Key</strong>.</li>
                      <li>Register your Webhook URL with WaafiPay.</li>
                      <li>Copy the generated Webhook URL above.</li>
                      <li>Receive the <strong>Webhook Secret</strong>.</li>
                      <li>Enter all credentials in the form.</li>
                      <li>Click <strong>Test Connection</strong> to verify settings.</li>
                      <li><strong>Save</strong> only after a successful connection test.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Security Note */}
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex gap-3">
                <Lock size={20} className="text-amber-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-amber-800 dark:text-amber-400">Security Note</p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    Your API keys and credentials are encrypted at rest. Never share these credentials with anyone.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end gap-3">
                {selectedProvider === 'WAAFIPAY' && (
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 dark:bg-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Activity size={18} className={testing ? 'animate-spin' : ''} />
                    {testing ? 'Testing...' : 'Test Connection'}
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} className={saving ? 'animate-spin' : ''} />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select a Provider</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose a payment provider from the list to configure its settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;

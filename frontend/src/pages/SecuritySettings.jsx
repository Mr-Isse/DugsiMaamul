import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetMFAStatusQuery,
  useSetupMFAMutation,
  useEnableMFAMutation,
  useDisableMFAMutation,
} from '../store/adminApiSlice';

const SecuritySettings = () => {
  const { data: mfaStatusData, isLoading: statusLoading, refetch } = useGetMFAStatusQuery();
  const [setupMFA, { isLoading: setupLoading }] = useSetupMFAMutation();
  const [enableMFA, { isLoading: enableLoading }] = useEnableMFAMutation();
  const [disableMFA, { isLoading: disableLoading }] = useDisableMFAMutation();

  const [setupStep, setSetupStep] = useState('idle'); // idle, setup, verify, enabled
  const [setupData, setSetupData] = useState(null);
  const [verifyToken, setVerifyToken] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(new Set());

  const mfaStatus = mfaStatusData?.data || { enabled: false, setupComplete: false };
  const loading = statusLoading || setupLoading || enableLoading || disableLoading;

  useEffect(() => {
    if (mfaStatus.enabled) {
      setSetupStep('enabled');
    }
  }, [mfaStatus.enabled]);

  const handleSetupMFA = async () => {
    try {
      const result = await setupMFA().unwrap();
      setSetupData(result.data);
      setSetupStep('setup');
      toast.success('MFA setup initiated. Please scan the QR code.');
    } catch (error) {
      toast.error('Failed to setup MFA. Please try again.');
      console.error('MFA setup error:', error);
    }
  };

  const handleEnableMFA = async () => {
    if (!verifyToken) {
      toast.error('Please enter the verification code');
      return;
    }
    try {
      await enableMFA({ token: verifyToken }).unwrap();
      setSetupStep('enabled');
      refetch();
      toast.success('Two-factor authentication enabled successfully!');
      setVerifyToken('');
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
      console.error('MFA enable error:', error);
    }
  };

  const handleDisableMFA = async () => {
    if (!disablePassword) {
      toast.error('Please enter your current password');
      return;
    }
    try {
      await disableMFA({ password: disablePassword }).unwrap();
      setSetupStep('idle');
      refetch();
      toast.success('Two-factor authentication disabled successfully!');
      setDisablePassword('');
    } catch (error) {
      toast.error('Failed to disable MFA. Please check your password.');
      console.error('MFA disable error:', error);
    }
  };

  const copyToClipboard = (text, codeIndex = null) => {
    navigator.clipboard.writeText(text);
    if (codeIndex !== null) {
      setCopiedCodes(prev => new Set([...prev, codeIndex]));
      setTimeout(() => {
        setCopiedCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(codeIndex);
          return newSet;
        });
      }, 2000);
    }
    toast.success('Copied to clipboard');
  };

  const copyAllBackupCodes = () => {
    const allCodes = setupData.backupCodes.join('\n');
    copyToClipboard(allCodes);
  };

  if (loading && setupStep === 'idle') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="space-y-6"><div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /><div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Security Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
            Manage your account security and two-factor authentication
          </p>
        </div>
      </div>

      {/* MFA Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            mfaStatus.enabled 
              ? 'bg-green-50 dark:bg-green-900/30' 
              : 'bg-amber-50 dark:bg-amber-900/30'
          }`}>
            {mfaStatus.enabled ? (
              <ShieldCheck size={18} className="text-green-600" />
            ) : (
              <ShieldAlert size={18} className="text-amber-600" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mfaStatus.enabled ? 'MFA is enabled' : 'MFA is not enabled'}
            </p>
          </div>
        </div>

        <div className="p-6">
          {setupStep === 'idle' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 flex gap-3">
                <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-semibold">Protect your account with 2FA</p>
                  <p>
                    Enable two-factor authentication to add an extra layer of security to your account.
                    You'll need to enter a code from your authenticator app when logging in.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSetupMFA}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition-all"
              >
                <Shield size={16} />
                Enable Two-Factor Authentication
              </button>
            </div>
          )}

          {setupStep === 'setup' && setupData && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Scan QR Code
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>

              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <img src={setupData.qrCode} alt="MFA QR Code" className="w-48 h-48" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Or enter this code manually:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={setupData.secret}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(setupData.secret)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Backup Codes
                  </label>
                  <button
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="text-sm text-primary hover:underline"
                  >
                    {showBackupCodes ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showBackupCodes && (
                  <div className="space-y-2">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold mb-2">
                        Save these backup codes securely. You can use them to access your account if you lose your authenticator device.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {setupData.backupCodes.map((code, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={code}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono"
                          />
                          <button
                            onClick={() => copyToClipboard(code, index)}
                            className={`px-2 py-2 rounded-lg transition-colors ${
                              copiedCodes.has(index)
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {copiedCodes.has(index) ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={copyAllBackupCodes}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Copy All Codes
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSetupStep('idle')}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSetupStep('verify')}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {setupStep === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Verify Setup
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code from your authenticator app to complete setup
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSetupStep('setup')}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleEnableMFA}
                  disabled={loading || verifyToken.length !== 6}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Enable MFA
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {setupStep === 'enabled' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex gap-3">
                <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-300 space-y-1">
                  <p className="font-semibold">Two-factor authentication is enabled</p>
                  <p>
                    Your account is now protected with 2FA. You'll need to enter a code from your authenticator app when logging in.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Disable Two-Factor Authentication
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter your current password to disable 2FA
                </p>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <button
                onClick={handleDisableMFA}
                disabled={loading || !disablePassword}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Unlock size={16} />
                    Disable Two-Factor Authentication
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Security Tips</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best practices for account security</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Use a strong, unique password for your account
            </p>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Store backup codes in a secure location offline
            </p>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Enable 2FA on all your important accounts
            </p>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Regularly review your account activity and connected devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;

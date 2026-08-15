import { useState, useEffect } from 'react';
import {
  Lock, Save, RefreshCw, Shield, AlertTriangle,
  CheckCircle, Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetPasswordPolicyQuery,
  useUpdatePasswordPolicyMutation,
} from '../store/adminApiSlice';

const ROLES = ['student', 'teacher', 'parent', 'schooladmin', 'admin'];

const ToggleSwitch = ({ enabled, onChange, label }) => (
  <label className="flex items-center justify-between py-2">
    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
    <button type="button" onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </label>
);

const PasswordPolicyPage = () => {
  const { data, isLoading, refetch } = useGetPasswordPolicyQuery();
  const [updatePolicy, { isLoading: saving }] = useUpdatePasswordPolicyMutation();

  const policyData = data?.data || data || {};

  const [form, setForm] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
    preventReuseCount: 5,
    lockoutAttempts: 5,
    lockoutDuration: 30,
    enforcementByRole: {},
  });

  useEffect(() => {
    if (policyData && Object.keys(policyData).length > 0) {
      setForm(p => ({
        ...p,
        minLength:            policyData.minLength ?? 8,
        requireUppercase:     policyData.requireUppercase ?? true,
        requireLowercase:     policyData.requireLowercase ?? true,
        requireNumbers:       policyData.requireNumbers ?? true,
        requireSpecialChars:  policyData.requireSpecialChars ?? true,
        maxAge:               policyData.maxAge ?? 90,
        preventReuseCount:    policyData.preventReuseCount ?? 5,
        lockoutAttempts:      policyData.lockoutAttempts ?? 5,
        lockoutDuration:      policyData.lockoutDuration ?? 30,
        enforcementByRole:    policyData.enforcementByRole || {},
      }));
    }
  }, [policyData]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleRoleEnforcement = (role) => {
    setForm(p => ({
      ...p,
      enforcementByRole: {
        ...p.enforcementByRole,
        [role]: !p.enforcementByRole[role],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        minLength: Number(form.minLength),
        maxAge: Number(form.maxAge),
        preventReuseCount: Number(form.preventReuseCount),
        lockoutAttempts: Number(form.lockoutAttempts),
        lockoutDuration: Number(form.lockoutDuration),
      };
      await updatePolicy(payload).unwrap();
      toast.success('Password policy updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update password policy');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Lock className="text-violet-600" size={28} />
            Password Policy
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0,1].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Lock className="text-violet-600" size={28} />
            Password Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Configure password requirements and security settings.
          </p>
        </div>
        <button onClick={refetch}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
          <RefreshCw size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Settings size={20} /> Password Requirements
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Minimum Length</label>
              <input type="number" min="4" max="128" value={form.minLength}
                onChange={e => set('minLength', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <ToggleSwitch label="Require uppercase letters" enabled={form.requireUppercase}
                onChange={v => set('requireUppercase', v)} />
              <ToggleSwitch label="Require lowercase letters" enabled={form.requireLowercase}
                onChange={v => set('requireLowercase', v)} />
              <ToggleSwitch label="Require numbers" enabled={form.requireNumbers}
                onChange={v => set('requireNumbers', v)} />
              <ToggleSwitch label="Require special characters" enabled={form.requireSpecialChars}
                onChange={v => set('requireSpecialChars', v)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Max Password Age (days)</label>
                <input type="number" min="0" value={form.maxAge}
                  onChange={e => set('maxAge', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
                <p className="text-xs text-slate-400 mt-1">Set to 0 to disable expiry</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Prevent Password Reuse (count)</label>
                <input type="number" min="0" value={form.preventReuseCount}
                  onChange={e => set('preventReuseCount', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
                <p className="text-xs text-slate-400 mt-1">Set to 0 to disable</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle size={20} /> Account Lockout
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Max Failed Attempts</label>
                <input type="number" min="1" value={form.lockoutAttempts}
                  onChange={e => set('lockoutAttempts', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Lockout Duration (minutes)</label>
                <input type="number" min="1" value={form.lockoutDuration}
                  onChange={e => set('lockoutDuration', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Shield size={20} /> Enforcement by Role
            </h2>
          </div>
          <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
            {ROLES.map(role => (
              <ToggleSwitch key={role}
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                enabled={form.enforcementByRole[role] ?? true}
                onChange={() => toggleRoleEnforcement(role)} />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
            <Save size={16} /> {saving ? 'Saving\u2026' : 'Save Policy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordPolicyPage;

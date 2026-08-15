import { useState, useMemo } from 'react';
import {
  Palette, Upload, Save, RotateCcw, Eye, Settings, Globe, Sparkles, X, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetWhiteLabelConfigQuery,
  useUpdateWhiteLabelConfigMutation,
} from '../store/adminApiSlice';

const DEFAULT_CONFIG = {
  schoolName: '',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  logoUrl: '',
  footerText: '',
  faviconUrl: '',
};

const WhiteLabelSettings = () => {
  const { data: configData, isLoading } = useGetWhiteLabelConfigQuery();
  const [updateConfig, { isLoading: saving }] = useUpdateWhiteLabelConfigMutation();

  const [form, setForm] = useState(DEFAULT_CONFIG);
  const [initialized, setInitialized] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useMemo(() => {
    if (configData && !initialized) {
      setForm({
        schoolName: configData.schoolName || '',
        primaryColor: configData.primaryColor || '#6366f1',
        secondaryColor: configData.secondaryColor || '#8b5cf6',
        logoUrl: configData.logoUrl || '',
        footerText: configData.footerText || '',
        faviconUrl: configData.faviconUrl || '',
      });
      setInitialized(true);
    }
  }, [configData, initialized]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    try {
      await updateConfig(form).unwrap();
      toast.success('Brand configuration saved');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save configuration');
    }
  };

  const handleReset = () => {
    if (configData) {
      setForm({
        schoolName: configData.schoolName || '',
        primaryColor: configData.primaryColor || '#6366f1',
        secondaryColor: configData.secondaryColor || '#8b5cf6',
        logoUrl: configData.logoUrl || '',
        footerText: configData.footerText || '',
        faviconUrl: configData.faviconUrl || '',
      });
    } else {
      setForm(DEFAULT_CONFIG);
    }
    toast.success('Form reset to saved values');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Palette className="text-purple-600" size={28} />
            White Label Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Customize your school's branding and appearance.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Eye size={16} /> {previewMode ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Settings size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Brand Configuration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Customize colors, logo, and school name</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                School Name
              </label>
              <input
                value={form.schoolName}
                onChange={e => set('schoolName', e.target.value)}
                placeholder="e.g. Springfield International School"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                School Logo URL
              </label>
              <div className="flex gap-3">
                <input
                  value={form.logoUrl}
                  onChange={e => set('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Upload logo"
                >
                  <Upload size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
                <input
                  value={form.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={e => set('secondaryColor', e.target.value)}
                  className="w-12 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
                <input
                  value={form.secondaryColor}
                  onChange={e => set('secondaryColor', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Footer Text
              </label>
              <textarea
                rows={3}
                value={form.footerText}
                onChange={e => set('footerText', e.target.value)}
                placeholder="Text displayed in the footer across the school portal"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
                <RotateCcw size={16} /> Reset
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
                <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Eye size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Live Preview</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">See how your branding looks</p>
              </div>
            </div>

            {/* Preview Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Preview Header */}
              <div
                className="px-6 py-5 flex items-center gap-4"
                style={{ backgroundColor: form.primaryColor }}
              >
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover bg-white" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Globe size={24} className="text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black text-white">
                    {form.schoolName || 'School Name'}
                  </h3>
                  <p className="text-xs text-white/70">Excellence in Education</p>
                </div>
              </div>

              {/* Preview Body */}
              <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/30 space-y-4">
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200"
                    style={{ backgroundColor: form.secondaryColor }}
                  >
                    Secondary Button
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Card Sample</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Content Area</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Another Card</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Sample Data</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    Status Badge
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: form.secondaryColor }}
                  >
                    Secondary Badge
                  </span>
                </div>
              </div>

              {/* Preview Footer */}
              <div
                className="px-6 py-4 text-center text-xs text-white/80"
                style={{ backgroundColor: form.primaryColor }}
              >
                {form.footerText || '© 2026 School Name. All rights reserved.'}
              </div>
            </div>

            {/* Color Palette Display */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-amber-500" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Color Palette</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="h-12 rounded-xl mb-2" style={{ backgroundColor: form.primaryColor }} />
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center">Primary</p>
                  <p className="text-[10px] font-mono text-slate-400 text-center">{form.primaryColor}</p>
                </div>
                <div className="flex-1">
                  <div className="h-12 rounded-xl mb-2" style={{ backgroundColor: form.secondaryColor }} />
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center">Secondary</p>
                  <p className="text-[10px] font-mono text-slate-400 text-center">{form.secondaryColor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhiteLabelSettings;

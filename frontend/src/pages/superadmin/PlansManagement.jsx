import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit3, Archive, ArchiveRestore, X, Check, Package,
  Users, BookOpen, GitBranch, HardDrive, MessageSquare, Mail, Star,
  DollarSign, ToggleLeft, ToggleRight, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  useGetPlansQuery, useCreatePlanMutation,
  useUpdatePlanMutation, useArchivePlanMutation,
  useGetFeatureRegistryQuery,
} from '../../store/superAdminApiSlice';
import { PageHeader, Panel, Field, superAdminInputClass, superAdminBtnPrimary, superAdminBtnGhost } from '../../components/superadmin/SuperAdminShell';
import { toast } from 'sonner';

const EMPTY_FORM = {
  name: '', code: '', description: '', monthlyPrice: '', yearlyPrice: '',
  currency: 'USD', trialDays: 0,
  limits: { students: 500, teachers: 20, parents: 5000, employees: 10, branches: 1, campuses: 1, admins: 2, storage: 5120, sms: 500, email: 5000, api: 100000, devices: 100 },
  features: [],
  isRecommended: false,
  status: 'active',
  whiteLabel: false,
  customDomain: false,
  mobileApp: true,
  supportLevel: 'Standard',
};

const LIMIT_FIELDS = [
  { key: 'students', icon: Users, label: 'Max Students', help: 'Use -1 for unlimited' },
  { key: 'teachers', icon: BookOpen, label: 'Max Teachers', help: 'Use -1 for unlimited' },
  { key: 'parents', icon: Users, label: 'Max Parents', help: 'Use -1 for unlimited' },
  { key: 'employees', icon: Users, label: 'Max Employees', help: 'Use -1 for unlimited' },
  { key: 'branches', icon: GitBranch, label: 'Max Branches', help: 'Use -1 for unlimited' },
  { key: 'campuses', icon: GitBranch, label: 'Max Campuses', help: 'Use -1 for unlimited' },
  { key: 'admins', icon: Users, label: 'Max Admins', help: '' },
  { key: 'storage', icon: HardDrive, label: 'Storage (MB)', help: 'e.g. 5120 = 5GB' },
  { key: 'sms', icon: MessageSquare, label: 'SMS Limit', help: '' },
  { key: 'email', icon: Mail, label: 'Email Limit', help: '' },
  { key: 'api', icon: MessageSquare, label: 'API Calls Limit', help: '' },
  { key: 'devices', icon: BookOpen, label: 'Max Devices', help: '' },
];

const STATUS_COLORS = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-slate-800 text-slate-500 border-slate-700',
};

const PlanCard = ({ plan, onEdit, onArchive }) => (
  <Panel className="p-6 flex flex-col gap-4 border-slate-200 dark:border-slate-800 shadow-slate-200/50 dark:shadow-slate-900/50">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 dark:text-white">{plan.name}</h3>
            {plan.isRecommended && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                <Star className="w-2.5 h-2.5 fill-current" /> Popular
              </span>
            )}
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{plan.code}</p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[plan.status] || STATUS_COLORS.inactive}`}>
        {plan.status}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Monthly</p>
        <p className="text-xl font-black text-slate-900 dark:text-white">${plan.monthlyPrice}<span className="text-xs text-slate-500 font-medium">/mo</span></p>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Yearly</p>
        <p className="text-xl font-black text-slate-900 dark:text-white">${plan.yearlyPrice}<span className="text-xs text-slate-500 font-medium">/yr</span></p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      {LIMIT_FIELDS.slice(0, 4).map(({ key, icon: Icon, label }) => (
        <div key={key} className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {plan.limits?.[key] === -1 ? '∞' : (plan.limits?.[key] ?? '—')} {label.replace('Max ', '')}
          </span>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
        <ToggleRight className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          {plan.features?.includes('ALL_MODULES') ? 'All Features' : `${plan.features?.length || 0} Features`}
        </span>
      </div>
    </div>

    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      <button
        onClick={() => onEdit(plan)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
      >
        <Edit3 className="w-3.5 h-3.5" /> Edit
      </button>
      <button
        onClick={() => onArchive(plan)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
          plan.status === 'active'
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border-slate-200 dark:border-slate-700 hover:border-rose-500/20'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
        }`}
      >
        {plan.status === 'active'
          ? <><Archive className="w-3.5 h-3.5" /> Archive</>
          : <><ArchiveRestore className="w-3.5 h-3.5" /> Restore</>
        }
      </button>
    </div>
  </Panel>
);

const PlanFormModal = ({ plan, onClose, onCreate, onUpdate, isCreating, isUpdating }) => {
  const { data: registryData } = useGetFeatureRegistryQuery();
  const featureRegistry = registryData?.features || [];
  const byCategory = registryData?.byCategory || {};
  const [expandedCategories, setExpandedCategories] = useState({});

  const [form, setForm] = useState(plan ? {
    name: plan.name, code: plan.code, description: plan.description || '',
    monthlyPrice: plan.monthlyPrice, yearlyPrice: plan.yearlyPrice,
    currency: plan.currency || 'USD', trialDays: plan.trialDays || 0,
    limits: { ...EMPTY_FORM.limits, ...plan.limits },
    features: plan.features || [],
    isRecommended: plan.isRecommended || false,
    status: plan.status || 'active',
    whiteLabel: plan.whiteLabel || false,
    customDomain: plan.customDomain || false,
    mobileApp: plan.mobileApp !== undefined ? plan.mobileApp : true,
    supportLevel: plan.supportLevel || 'Standard',
  } : EMPTY_FORM);

  const handleLimitChange = (key, val) => {
    setForm(f => ({ ...f, limits: { ...f.limits, [key]: Number(val) } }));
  };

  const toggleFeature = (code) => {
    setForm(f => {
      const has = f.features.includes(code);
      // Remove ALL_MODULES if toggling individual features
      let features = f.features.filter(c => c !== 'ALL_MODULES');
      if (has) {
        features = features.filter(c => c !== code);
      } else {
        features = [...features, code];
      }
      return { ...f, features };
    });
  };

  const toggleAllModules = () => {
    setForm(f => {
      const isAll = f.features.includes('ALL_MODULES');
      return {
        ...f,
        features: isAll ? [] : ['ALL_MODULES'],
      };
    });
  };

  const toggleCategory = (category) => {
    const categoryFeatures = byCategory[category] || [];
    const codes = categoryFeatures.map(f => f.code);
    const allEnabled = codes.every(c => form.features.includes(c));
    setForm(f => {
      let features = f.features.filter(c => c !== 'ALL_MODULES');
      if (allEnabled) {
        features = features.filter(c => !codes.includes(c));
      } else {
        codes.forEach(c => { if (!features.includes(c)) features.push(c); });
      }
      return { ...f, features };
    });
  };

  const toggleExpand = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.monthlyPrice || !form.yearlyPrice) {
      toast.error('Name, code, monthly price and yearly price are required.');
      return;
    }
    try {
      if (plan) {
        await onUpdate({ id: plan._id, ...form }).unwrap();
        toast.success('Plan updated successfully!');
      } else {
        await onCreate(form).unwrap();
        toast.success('Plan created successfully!');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save plan.');
    }
  };

  const loading = isCreating || isUpdating;
  const isAllModules = form.features.includes('ALL_MODULES');
  const featureCount = isAllModules ? 'All' : form.features.length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-16 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-800"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-black text-white">{plan ? 'Edit Plan' : 'Create New Plan'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Plan Name">
              <input className={superAdminInputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Professional" />
            </Field>
            <Field label="Plan Code (Unique)">
              <input className={superAdminInputClass} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="PROFESSIONAL" />
            </Field>
          </div>
          <Field label="Plan Description">
            <textarea
              className={`${superAdminInputClass} min-h-[80px] pt-3`}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="A short description of what this plan includes"
            />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Monthly Price">
              <input type="number" className={superAdminInputClass} value={form.monthlyPrice} onChange={e => setForm(f => ({ ...f, monthlyPrice: e.target.value }))} placeholder="129" />
            </Field>
            <Field label="Yearly Price">
              <input type="number" className={superAdminInputClass} value={form.yearlyPrice} onChange={e => setForm(f => ({ ...f, yearlyPrice: e.target.value }))} placeholder="1238" />
            </Field>
            <Field label="Currency">
              <select className={superAdminInputClass} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option>USD</option><option>EUR</option><option>GBP</option><option>AED</option>
              </select>
            </Field>
            <Field label="Trial Days">
              <input type="number" className={superAdminInputClass} value={form.trialDays} onChange={e => setForm(f => ({ ...f, trialDays: Number(e.target.value) }))} placeholder="14" />
            </Field>
          </div>

          {/* Limits */}
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Plan Limits</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LIMIT_FIELDS.map(({ key, icon: Icon, label, help }) => (
                <Field key={key} label={label} error={help}>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      className={`${superAdminInputClass} pl-9`}
                      value={form.limits[key]}
                      onChange={e => handleLimitChange(key, e.target.value)}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </div>

          {/* Features — Categorized Toggle Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3 ml-1">
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                Feature Matrix <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px]">{featureCount} enabled</span>
              </p>
              <button
                onClick={toggleAllModules}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                  isAllModules
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Star className="w-3 h-3" /> {isAllModules ? 'All Modules ✓' : 'Enable All'}
              </button>
            </div>

            {!isAllModules && (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {Object.entries(byCategory).map(([category, features]) => {
                  const codes = features.map(f => f.code);
                  const enabledCount = codes.filter(c => form.features.includes(c)).length;
                  const allEnabled = enabledCount === codes.length;
                  const isExpanded = expandedCategories[category] !== false; // default expanded

                  return (
                    <div key={category} className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden">
                      {/* Category Header */}
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <button
                          onClick={() => toggleExpand(category)}
                          className="flex items-center gap-2 text-left"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                          <span className="text-xs font-black text-slate-300 uppercase tracking-wider">{category}</span>
                          <span className="text-[9px] font-black text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">{enabledCount}/{codes.length}</span>
                        </button>
                        <button
                          onClick={() => toggleCategory(category)}
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-colors ${
                            allEnabled
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                          }`}
                        >
                          {allEnabled ? 'Deselect' : 'Select All'}
                        </button>
                      </div>

                      {/* Feature Toggles */}
                      {isExpanded && (
                        <div className="grid grid-cols-2 gap-1 px-3 pb-3">
                          {features.map(({ code, label }) => {
                            const enabled = form.features.includes(code);
                            return (
                              <button
                                key={code}
                                onClick={() => toggleFeature(code)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                  enabled
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    : 'bg-slate-900 text-slate-500 border border-slate-800 hover:bg-slate-800 hover:text-slate-400'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center flex-shrink-0 ${
                                  enabled ? 'bg-indigo-500' : 'bg-slate-700'
                                }`}>
                                  {enabled && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className="truncate">{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {featureRegistry.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4 italic font-medium">Loading feature registry...</p>
                )}
              </div>
            )}

            {isAllModules && (
              <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center">
                <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-amber-400 font-bold">All Modules Enabled</p>
                <p className="text-xs text-slate-500 mt-1">This plan includes every current and future feature.</p>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setForm(f => ({ ...f, isRecommended: !f.isRecommended }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.isRecommended ? 'bg-amber-500' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isRecommended ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Mark as Popular</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setForm(f => ({ ...f, status: f.status === 'active' ? 'inactive' : 'active' }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.status === 'active' ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.status === 'active' ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Active</span>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setForm(f => ({ ...f, whiteLabel: !f.whiteLabel }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.whiteLabel ? 'bg-indigo-500' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.whiteLabel ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">White Label</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setForm(f => ({ ...f, customDomain: !f.customDomain }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.customDomain ? 'bg-indigo-500' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.customDomain ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Custom Domain</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setForm(f => ({ ...f, mobileApp: !f.mobileApp }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.mobileApp ? 'bg-indigo-500' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.mobileApp ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Mobile App</span>
              </label>
            </div>
            <Field label="Support Level">
              <select
                className={superAdminInputClass}
                value={form.supportLevel}
                onChange={e => setForm(f => ({ ...f, supportLevel: e.target.value }))}
              >
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Custom">Custom</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-slate-800 bg-slate-900/50">
          <button onClick={onClose} className={superAdminBtnGhost} disabled={loading}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className={superAdminBtnPrimary}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {plan ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PlansManagement = () => {
  const { data: rawPlans = [], isLoading } = useGetPlansQuery();
  const plans = Array.isArray(rawPlans) ? rawPlans : [];
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [archivePlan] = useArchivePlanMutation();
  const [editingPlan, setEditingPlan] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleArchive = async (plan) => {
    try {
      await archivePlan(plan._id).unwrap();
      toast.success(`Plan ${plan.status === 'active' ? 'archived' : 'restored'} successfully.`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update plan.');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Plan Management"
        subtitle="Create and manage SaaS subscription plans"
        action={
          <button onClick={() => setShowCreate(true)} className={superAdminBtnPrimary}>
            <Plus className="w-4 h-4" /> New Plan
          </button>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-72 bg-slate-800 animate-pulse rounded-[2.5rem]" />)}
        </div>
      ) : plans.length === 0 ? (
        <Panel className="p-20 text-center">
          <Package className="w-12 h-12 text-slate-800 mx-auto mb-4" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">No plans yet</p>
          <p className="text-sm text-slate-400 mb-6 font-medium">Create your first pricing plan to get started</p>
          <button onClick={() => setShowCreate(true)} className={superAdminBtnPrimary}>
            <Plus className="w-4 h-4" /> Create First Plan
          </button>
        </Panel>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map(plan => (
            <PlanCard key={plan._id} plan={plan} onEdit={setEditingPlan} onArchive={handleArchive} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {(showCreate || editingPlan) && (
          <PlanFormModal
            plan={editingPlan || null}
            onClose={() => { setShowCreate(false); setEditingPlan(null); }}
            onCreate={createPlan}
            onUpdate={updatePlan}
            isCreating={isCreating}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlansManagement;

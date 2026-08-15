import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Mail, Lock, ShieldCheck, Loader2, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCreateSchoolAdminMutation, useGetPlansQuery } from '../../store/superAdminApiSlice';
import { PageHeader, Panel, Field, superAdminInputClass, superAdminBtnPrimary, superAdminBtnGhost } from '../../components/superadmin/SuperAdminShell';

const RegisterSchoolAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [planId, setPlanId] = useState('');
  const [trialDays, setTrialDays] = useState('14');
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);

  const { data: plansData, isLoading: isLoadingPlans } = useGetPlansQuery();
  const plans = Array.isArray(plansData) ? plansData : [];

  // Automatically select a default plan if available
  useEffect(() => {
    if (plans.length > 0 && !planId) {
      const defaultPlan = plans.find(p => p.isRecommended) || plans[0];
      setPlanId(defaultPlan._id);
    }
  }, [plans, planId]);

  const [createAdmin, { isLoading }] = useCreateSchoolAdminMutation();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email';
    if (password.length < 6) e.password = 'Security requires at least 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    if (!planId) e.planId = 'A subscription plan MUST be selected';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const res = await createAdmin({
        email: email.trim().toLowerCase(),
        password,
        planId,
        trialDays: parseInt(trialDays)
      }).unwrap();
      setDone(res.admin || { email: email.trim().toLowerCase() });
      setEmail('');
      setPassword('');
      setConfirm('');
      // Keep planId as is
      toast.success('Tenant & Administrator account provisioned');
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to create tenant account');
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Panel className="p-12 text-center border-emerald-500/20 bg-emerald-500/5 shadow-xl shadow-emerald-500/10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Access Provisioned</h2>
            <p className="text-slate-400 font-medium mt-4">
              Credentials for <span className="text-indigo-400 font-bold">{done.email}</span> have been successfully generated, and the tenant has been assigned to the selected plan.
            </p>
            <div className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-left">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                     <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                     <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Next Step</p>
                     <p className="text-sm text-slate-300 font-medium leading-relaxed">
                        The administrator can now sign in at the platform gateway. Upon first login, they will be redirected to complete their school profile (name, logo, address, phone) before accessing the dashboard. The selected plan limits are already applied.
                     </p>
                  </div>
               </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <button type="button" className={superAdminBtnPrimary} onClick={() => setDone(null)}>
                Provision Another
              </button>
              <Link to="/admin/schools" className={superAdminBtnGhost}>
                Return to Directory
              </Link>
            </div>
          </Panel>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Issue Credentials"
        subtitle="Provision a new tenant environment and administrative account."
        backTo="/admin/admins"
        backLabel="Platform Admins"
      />

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Panel className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <TrendingUp size={18} />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">1. Subscription Plan</h3>
                </div>
                
                <Field label="SELECT PLAN" error={errors.planId}>
                  {isLoadingPlans ? (
                    <div className="text-sm text-slate-500 animate-pulse flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing plans...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {plans.map(plan => (
                        <label 
                          key={plan._id} 
                          className={`
                            relative flex items-center justify-between p-5 cursor-pointer rounded-2xl border-2 transition-all duration-300
                            ${planId === plan._id 
                              ? 'border-indigo-600 bg-indigo-500/10 shadow-xl shadow-indigo-500/10' 
                              : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
                            }
                          `}
                        >
                          <input 
                            type="radio" 
                            name="planId" 
                            value={plan._id} 
                            checked={planId === plan._id}
                            onChange={(e) => setPlanId(e.target.value)}
                            className="sr-only"
                          />
                          <div>
                            <p className={`font-black uppercase tracking-widest text-xs ${planId === plan._id ? 'text-white' : 'text-slate-500'}`}>
                              {plan.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                               <p className="text-sm font-black text-slate-300">
                                 {plan.limits.students === -1 ? 'Unlimited' : plan.limits.students.toLocaleString()}
                               </p>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Students Cap</span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${planId === plan._id ? 'border-indigo-400 bg-indigo-400' : 'border-slate-700'}`}>
                            {planId === plan._id && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </Field>

                {planId && plans.find(p => p._id === planId)?.code.toLowerCase() === 'trial' && (
                  <Field label="TRIAL DURATION" error={errors.trialDays}>
                    <div className="grid grid-cols-3 gap-4">
                      {['7', '14', '30'].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setTrialDays(days)}
                          className={`
                            px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all
                            ${trialDays === days 
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                              : 'border-slate-800 text-slate-400 bg-slate-900/30 hover:border-slate-700'
                            }
                          `}
                        >
                          {days} Days
                        </button>
                      ))}
                    </div>
                  </Field>
                )}
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">2. Admin Credentials</h3>
                </div>
                
                <Field label="EMAIL ADDRESS" error={errors.email}>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${superAdminInputClass} pl-14 py-4`}
                      placeholder="admin@school.com"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="SECURE PASSWORD" error={errors.password}>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${superAdminInputClass} pl-14 py-4`}
                        placeholder="••••••••"
                      />
                    </div>
                  </Field>

                  <Field label="CONFIRM PASSWORD" error={errors.confirm}>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`${superAdminInputClass} pl-14 py-4`}
                        placeholder="••••••••"
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${superAdminBtnPrimary} py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-600/30 group`}
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Provisioning Tenant...</>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Create Tenant & Account</span>
                  </div>
                )}
              </button>
            </form>
          </Panel>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Panel className="p-8 bg-indigo-600 text-white border-none shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
               <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 border border-white/30">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Tenant Security</h3>
               <p className="text-indigo-100 font-medium leading-relaxed">
                 You are creating a top-level tenant environment. The selected plan limits will be strictly enforced at the database level for all resource creation operations.
               </p>
            </div>
          </Panel>

          <Panel className="p-8 bg-[#0f172a] border-slate-800">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-400" /> Platform Rules
             </h4>
             <ul className="space-y-4">
               {[
                 'Plan selection is mandatory',
                 'Limits applied instantly',
                 'Subdomain auto-generated',
                 'Profile completed on first login'
               ].map((rule, i) => (
                 <li key={i} className="flex items-center gap-3 text-xs font-black text-white uppercase tracking-widest group">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform" />
                    {rule}
                 </li>
               ))}
             </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default RegisterSchoolAdmin;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle2, XCircle, Clock, Filter, Eye, X,
  Building2, CreditCard, Calendar, Users, BadgeCheck,
  AlertTriangle, ChevronDown, ChevronRight, MessageSquare, RefreshCw,
  TrendingUp, ShieldAlert, Hourglass,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetSubscriptionsQuery, useReviewSubscriptionMutation } from '../../store/superAdminApiSlice';
import { PageHeader, Panel, Field, superAdminInputClass, superAdminBtnPrimary, superAdminBtnGhost, superAdminBtnDanger, Badge } from '../../components/superadmin/SuperAdminShell';

// ─── Approval Badge ───────────────────────────────────────────────────────────
const ApprovalBadge = ({ status }) => {
  const map = {
    pending:  { cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Hourglass,   label: 'Pending' },
    approved: { cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: BadgeCheck, label: 'Approved' },
    denied:   { cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: XCircle,      label: 'Denied' },
  };
  const { cls, icon: Icon, label } = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// ─── Stats Cards ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`p-5 rounded-[2.5rem] border bg-white dark:bg-[#1e293b] flex items-center gap-4 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40 border-slate-100 dark:border-slate-800 ${color}`}>
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-current/10">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Review Modal ─────────────────────────────────────────────────────────────
const ReviewModal = ({ school, onClose, onDone }) => {
  const [action, setAction]   = useState(''); // 'approve' | 'deny'
  const [note, setNote]       = useState('');
  const [review, { isLoading }] = useReviewSubscriptionMutation();

  const submit = async () => {
    if (!action) return toast.error('Please choose Approve or Deny.');
    try {
      await review({ schoolId: school._id, action, note }).unwrap();
      toast.success(`Subscription ${action}d for ${school.name}`);
      onDone();
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to update subscription status.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Review Subscription</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{school.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Tenant & Plan Info */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Plan</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {school.subscription?.plan?.name || school.subscription?.type || 'Trial'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Current Status</span>
              <ApprovalBadge status={school.subscription?.approvalStatus || 'pending'} />
            </div>
            {school.subscription?.endDate && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Expiry</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {new Date(school.subscription.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Action Selection */}
          <Field label="Decision">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction('approve')}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200
                  ${action === 'approve' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/30'}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setAction('deny')}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200
                  ${action === 'deny' ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/30'}`}
              >
                <XCircle className="w-4 h-4" />
                Deny
              </button>
            </div>
          </Field>

          {/* Note */}
          <Field label="Note (Optional)">
            <div className="relative">
              <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={action === 'deny' ? 'Reason for denial...' : 'Approval notes (optional)...'}
                className={`${superAdminInputClass} pl-11 resize-none`}
              />
            </div>
          </Field>

          {action === 'deny' && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
                Denying will block this tenant's access to the platform. The school admin will not be able to log in.
              </p>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className={superAdminBtnGhost}>Cancel</button>
          <button
            onClick={submit}
            disabled={isLoading || !action}
            className={action === 'deny' ? superAdminBtnDanger : superAdminBtnPrimary}
          >
            {isLoading ? 'Processing...' : action === 'approve' ? 'Approve Subscription' : action === 'deny' ? 'Deny Subscription' : 'Select a Decision'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const SubscriptionsManagement = () => {
  const [search, setSearch]           = useState('');
  const [approval, setApproval]       = useState('all');
  const [selectedSub, setSelectedSub] = useState(null);   // for review modal
  const [detailSub, setDetailSub]     = useState(null);   // for details panel

  const { data: res, isLoading, isFetching, refetch } = useGetSubscriptionsQuery(
    { approval: approval !== 'all' ? approval : undefined, search: search || undefined },
    { refetchOnMountOrArgChange: true }
  );

  const subscriptions = res?.data?.subscriptions || [];
  const total         = res?.data?.total || 0;

  // Derived stats
  const pending  = subscriptions.filter(s => (s.subscription?.approvalStatus || 'pending') === 'pending').length;
  const approved = subscriptions.filter(s => s.subscription?.approvalStatus === 'approved').length;
  const denied   = subscriptions.filter(s => s.subscription?.approvalStatus === 'denied').length;

  const filterBtns = [
    { label: 'All',      value: 'all',      count: total },
    { label: 'Pending',  value: 'pending',  count: pending  },
    { label: 'Approved', value: 'approved', count: approved },
    { label: 'Denied',   value: 'denied',   count: denied   },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Subscriptions"
        subtitle="Review, approve, or deny tenant subscription requests from registered schools."
        action={
          <button onClick={refetch} disabled={isFetching} className={`${superAdminBtnGhost} gap-2`}>
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Pending Review"  value={pending}  icon={Hourglass}    color="text-amber-500  border-amber-100"  />
        <StatCard label="Approved"        value={approved} icon={BadgeCheck}   color="text-emerald-500 border-emerald-100" />
        <StatCard label="Denied"          value={denied}   icon={ShieldAlert}  color="text-rose-500   border-rose-100"   />
      </div>

      {/* Filters & Search */}
      <Panel className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by school name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${superAdminInputClass} pl-11`}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filterBtns.map(f => (
              <button
                key={f.value}
                onClick={() => setApproval(f.value)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                  ${approval === f.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                {f.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${approval === f.value ? 'bg-white/20' : 'bg-white dark:bg-slate-900 text-slate-500'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Subscriptions Table */}
        <div className="lg:col-span-2">
          <Panel className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">School</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    [1,2,3,4,5].map(i => (
                      <tr key={i}>
                        <td colSpan={4} className="px-6 py-8">
                          <div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-full" />
                        </td>
                      </tr>
                    ))
                  ) : subscriptions.length > 0 ? (
                    subscriptions.map(school => (
                      <tr
                        key={school._id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${detailSub?._id === school._id ? 'bg-indigo-500/10' : ''}`}
                        onClick={() => setDetailSub(school)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase shadow-sm">
                              {school.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{school.name}</p>
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{school.email || school.subdomain}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{school.subscription?.plan?.name || school.subscription?.type || 'Trial'}</span>
                             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Plan</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <ApprovalBadge status={school.subscription?.approvalStatus || 'pending'} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button
                               onClick={(e) => { e.stopPropagation(); setSelectedSub(school); }}
                               className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-all"
                               title="Review Request"
                             >
                               <BadgeCheck size={18} />
                             </button>
                             <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No subscription requests</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Details Sidebar */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {detailSub ? (
              <motion.div
                key={detailSub._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Panel className="p-8 border-none shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/40 sticky top-28">
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                       <Building2 size={28} />
                     </div>
                     <ApprovalBadge status={detailSub.subscription?.approvalStatus || 'pending'} />
                  </div>

                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                       <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{detailSub.name}</h3>
                       <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{detailSub.email || detailSub.subdomain}</p>
                    </div>

                    <div className="grid gap-4">
                       <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <Calendar size={12} /> Expiry Date
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {detailSub.subscription?.endDate ? new Date(detailSub.subscription.endDate).toLocaleDateString() : 'N/A'}
                          </p>
                       </div>
                       <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <TrendingUp size={12} /> Billing Status
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                            {detailSub.subscription?.paymentStatus || 'Pending'}
                          </p>
                       </div>
                    </div>

                    {detailSub.subscription?.approvalNote && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Reviewer Note</h4>
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                           <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">"{detailSub.subscription.approvalNote}"</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedSub(detailSub)}
                      className="w-full py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                      Update Decision
                    </button>
                  </div>
                </Panel>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800/50">
                 <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                   <CreditCard size={32} />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Select a tenant</h3>
                 <p className="text-slate-500 text-sm font-medium">Choose a school from the list to view subscription details and history.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedSub && (
          <ReviewModal
            school={selectedSub}
            onClose={() => setSelectedSub(null)}
            onDone={() => { setSelectedSub(null); refetch(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionsManagement;

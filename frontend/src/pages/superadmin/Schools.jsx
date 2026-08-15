import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Power,
  PowerOff,
  Eye,
  Calendar,
  X,
  Check,
  AlertTriangle,
  School,
  Trash2,
  MoreVertical,
  BadgeCheck,
} from 'lucide-react';
import { 
  getSchools, 
  deleteSchool, 
  toggleBlock, 
  extendSubscription, 
  getPlans, 
  assignPlan 
} from '../../services/superAdminApi';
import { toast } from 'sonner';
import { PageHeader, Panel, Field, Badge, superAdminInputClass, superAdminBtnPrimary, superAdminBtnGhost } from '../../components/superadmin/SuperAdminShell';
import ConfirmModal from '../../components/ConfirmModal';

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, subscription, changePlan
  const [extendMonths, setExtendMonths] = useState(1);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    school: null,
  });

  useEffect(() => {
    fetchSchools();
    fetchPlans();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filter !== 'all') {
        if (filter === 'active') params.status = 'active';
        if (filter === 'inactive') params.status = 'inactive';
        if (filter === 'expired') params.isBlocked = 'true';
      }
      
      const response = await getSchools(params);
      setSchools(response.data.schools);
    } catch (error) {
      const errorMsg = error.response?.data?.userMessage || error.response?.data?.message || 'Failed to load schools';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await getPlans();
      const plansData = response.data?.data || response.data || [];
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSchools();
  };

  const handleToggleBlock = async (school) => {
    const newStatus = !school.subscription?.blockedByAdmin;
    try {
      await toggleBlock(school._id, { 
        block: newStatus,
        reason: newStatus ? 'Blocked by administrator' : undefined
      });
      toast.success(`School ${newStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchSchools();
    } catch (error) {
      const errorMsg = error.response?.data?.userMessage || error.response?.data?.message || 'Failed to update school status';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (school) => {
    setConfirmModal({
      isOpen: true,
      school,
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteSchool(confirmModal.school._id);
      toast.success('School deleted successfully');
      fetchSchools();
    } catch (error) {
      const errorMsg = error.response?.data?.userMessage || error.response?.data?.message || 'Failed to delete school';
      toast.error(errorMsg);
    }
  };

  const handleExtendSubscription = async () => {
    try {
      await extendSubscription(selectedSchool._id, { months: extendMonths });
      toast.success(`Subscription extended by ${extendMonths} month(s)`);
      setShowModal(false);
      fetchSchools();
    } catch (error) {
      const errorMsg = error.response?.data?.userMessage || error.response?.data?.message || 'Failed to extend subscription';
      toast.error(errorMsg);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) return toast.error('Please select a plan');
    try {
      await assignPlan(selectedSchool._id, { 
        planId: selectedPlanId,
        billingInterval 
      });
      toast.success(`School plan updated to ${plans.find(p => p._id === selectedPlanId)?.name}`);
      setShowModal(false);
      fetchSchools();
    } catch (error) {
      const errorMsg = error.response?.data?.userMessage || error.response?.data?.message || 'Failed to update plan';
      toast.error(errorMsg);
    }
  };

  const openModal = (school, mode) => {
    setSelectedSchool(school);
    setModalMode(mode);
    setShowModal(true);
    if (mode === 'changePlan') {
      setSelectedPlanId(school.subscription?.plan?._id || school.subscription?.plan || '');
      setBillingInterval(school.subscription?.type || 'monthly');
    }
  };

  const getStatusBadge = (school) => {
    if (school.subscription?.blockedByAdmin) {
      return <Badge variant="danger">Blocked</Badge>;
    }
    if (!school.isActive) {
      return <Badge>Inactive</Badge>;
    }
    if (school.isSubscriptionExpired) {
      return <Badge variant="warning">Expired</Badge>;
    }
    return <Badge variant="success">Active</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const variant = status === 'Paid' ? 'success' : status === 'Unpaid' ? 'danger' : 'warning';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="School Tenants" 
        subtitle="Manage subscriptions and access control" 
      />

      <Panel className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search schools by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${superAdminInputClass} pl-12`}
            />
          </form>
          <div className="flex gap-3">
             <select
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className={`${superAdminInputClass} md:w-48 cursor-pointer font-bold`}
             >
               <option value="all">All Status</option>
               <option value="active">Active Only</option>
               <option value="inactive">Inactive Only</option>
               <option value="expired">Blocked / Expired</option>
             </select>
          </div>
        </div>
      </Panel>

      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Panel className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">School Details</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tier</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Expiry</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    [1,2,3].map(i => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-full" /></td>
                      </tr>
                    ))
                  ) : schools.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <School className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                          <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs">No schools found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    schools.map((school) => (
                      <tr key={school._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black shadow-inner group-hover:scale-110 transition-transform">
                              {school.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate max-w-[180px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{school.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mt-0.5">{school.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">{getStatusBadge(school)}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-300 capitalize">{school.subscription?.type || 'Trial'}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Plan Type</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                            <Calendar size={14} className="text-slate-500" />
                            {school.subscription?.endDate ? new Date(school.subscription.endDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           {getPaymentStatusBadge(school.subscription?.paymentStatus || 'Pending')}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openModal(school, 'view')}
                              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => openModal(school, 'subscription')}
                              className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-800 rounded-lg transition-all"
                              title="Manage Subscription"
                            >
                              <Calendar size={18} />
                            </button>
                            <button 
                              onClick={() => handleToggleBlock(school)}
                              className={`p-2 rounded-lg transition-all ${
                                school.subscription?.blockedByAdmin 
                                ? 'text-emerald-500 hover:bg-emerald-500/10' 
                                : 'text-amber-500 hover:bg-amber-500/10'
                              }`}
                              title={school.subscription?.blockedByAdmin ? 'Unblock' : 'Block'}
                            >
                              {school.subscription?.blockedByAdmin ? <Power size={18} /> : <PowerOff size={18} />}
                            </button>
                            <button 
                              onClick={() => handleDelete(school)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-40 bg-slate-800 animate-pulse rounded-[2.5rem]" />)
          ) : schools.length === 0 ? (
            <div className="p-20 text-center bg-[#1e293b] rounded-[2.5rem] border border-slate-800">
               <School className="w-12 h-12 text-slate-800 mx-auto mb-4" />
               <p className="font-black text-slate-500 uppercase tracking-widest text-xs">No schools found</p>
            </div>
          ) : (
            schools.map((school) => (
              <div key={school._id} className="bg-[#1e293b] rounded-[2.5rem] p-6 border border-slate-800 shadow-xl shadow-slate-900/40 active:scale-[0.98] transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 font-black shadow-inner">
                      {school.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white leading-tight truncate">{school.name}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{school.email || 'No email'}</p>
                    </div>
                  </div>
                  {getStatusBadge(school)}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tier</p>
                    <p className="text-sm font-bold text-slate-300 capitalize">{school.subscription?.type || 'Trial'}</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Expiry</p>
                    <p className="text-sm font-bold text-slate-300">
                      {school.subscription?.endDate ? new Date(school.subscription.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex gap-2">
                    <button onClick={() => openModal(school, 'view')} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all border border-slate-800">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleToggleBlock(school)} className={`p-2 rounded-xl transition-all border border-slate-800 ${school.subscription?.blockedByAdmin ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-amber-500 hover:bg-amber-500/10'}`}>
                      {school.subscription?.blockedByAdmin ? <Check size={18} /> : <PowerOff size={18} />}
                    </button>
                  </div>
                  <button onClick={() => handleDelete(school)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-slate-800">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && selectedSchool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-800"
            >
              <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h2 className="text-xl font-black text-white">
                  {modalMode === 'view' ? 'School Intelligence' : 
                   modalMode === 'subscription' ? 'Subscription Control' : 
                   'Safe Plan Upgrade'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500"><X size={20} /></button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {modalMode === 'view' ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-800">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/20">
                        {selectedSchool.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">{selectedSchool.name}</h3>
                        <p className="text-indigo-400 font-bold">{selectedSchool.email || 'No email'}</p>
                        <div className="mt-2">{getStatusBadge(selectedSchool)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Email</p>
                        <p className="font-bold text-white">{selectedSchool.email || 'N/A'}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registration Status</p>
                        <p className="font-bold text-white">{selectedSchool.isActive ? 'Registered' : 'Pending'}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-900/50 rounded-[2rem] border border-slate-800">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                         Subscription Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Tier</p>
                            <p className="font-bold text-indigo-400 text-lg capitalize">{selectedSchool.subscription?.plan?.name || selectedSchool.subscription?.type || 'Trial'}</p>
                         </div>
                         <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Payment Status</p>
                            {getPaymentStatusBadge(selectedSchool.subscription?.paymentStatus || 'Pending')}
                         </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                         <button 
                           onClick={() => setModalMode('subscription')}
                           className="flex-1 py-3 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                         >
                           Extend Access
                         </button>
                         <button 
                           onClick={() => setModalMode('changePlan')}
                           className="flex-1 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                         >
                           Change Plan
                         </button>
                      </div>
                    </div>
                  </div>
                ) : modalMode === 'subscription' ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20">
                       <h4 className="font-black text-lg mb-1">Modify Tenant Access</h4>
                       <p className="text-sm text-indigo-100 font-medium">Extend the operational window for this educational institution.</p>
                    </div>

                    <Field label="Extension Duration (Months)">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={extendMonths}
                          onChange={(e) => setExtendMonths(parseInt(e.target.value))}
                          className={superAdminInputClass}
                        />
                        <button onClick={handleExtendSubscription} className={superAdminBtnPrimary}>
                          Apply Extension
                        </button>
                      </div>
                    </Field>
                    
                    <button onClick={() => setModalMode('view')} className="w-full text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                      Back to Overview
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-6 bg-emerald-600 rounded-[2rem] text-white shadow-xl shadow-emerald-600/20">
                       <h4 className="font-black text-lg mb-1 flex items-center gap-2">
                         <BadgeCheck className="w-6 h-6" /> Safe Plan Upgrade
                       </h4>
                       <p className="text-sm text-emerald-100 font-medium">Updating the plan will recalculate usage limits and feature access. No existing data will be affected.</p>
                    </div>

                    <div className="space-y-4">
                      <Field label="Select New Plan">
                        <div className="grid sm:grid-cols-2 gap-3">
                          {plans.map(plan => (
                            <button
                              key={plan._id}
                              onClick={() => setSelectedPlanId(plan._id)}
                              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                selectedPlanId === plan._id 
                                ? 'border-indigo-500 bg-indigo-500/10' 
                                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                              }`}
                            >
                              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedPlanId === plan._id ? 'text-indigo-400' : 'text-slate-500'}`}>
                                {plan.name}
                              </p>
                              <p className="text-sm font-bold text-white">${plan.monthlyPrice}/mo</p>
                            </button>
                          ))}
                        </div>
                      </Field>

                      <Field label="Billing Interval">
                         <div className="flex gap-3">
                            <button
                              onClick={() => setBillingInterval('monthly')}
                              className={`flex-1 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                                billingInterval === 'monthly' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-800 text-slate-500'
                              }`}
                            >
                              Monthly
                            </button>
                            <button
                              onClick={() => setBillingInterval('yearly')}
                              className={`flex-1 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                                billingInterval === 'yearly' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-800 text-slate-500'
                              }`}
                            >
                              Yearly
                            </button>
                         </div>
                      </Field>

                      <div className="pt-4">
                        <button 
                          onClick={handleChangePlan}
                          className={`w-full ${superAdminBtnPrimary} py-4 rounded-2xl shadow-xl shadow-indigo-600/20`}
                        >
                          Confirm Safe Upgrade
                        </button>
                      </div>
                    </div>

                    <button onClick={() => setModalMode('view')} className="w-full text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                      Back to Overview
                    </button>
                  </div>
                )}
              </div>

              <div className="px-8 py-6 bg-slate-900/50 border-t border-slate-800 flex items-center justify-end gap-3">
                 <button onClick={() => setShowModal(false)} className={superAdminBtnGhost}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete School"
        message={`Are you sure you want to delete ${confirmModal.school?.name}? This action cannot be undone and will delete all associated data.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Schools;

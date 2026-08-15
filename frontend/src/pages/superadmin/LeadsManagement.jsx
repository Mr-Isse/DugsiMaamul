import React, { useState } from 'react';
import { useGetLeadsQuery, useUpdateLeadMutation } from '../../store/superAdminApiSlice';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Globe, 
  Building2, 
  Clock, 
  CheckCircle2,
  Send,
  XCircle,
  MoreVertical,
  Loader2,
  Calendar,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader, Panel, Badge, superAdminInputClass, superAdminBtnPrimary } from '../../components/superadmin/SuperAdminShell';
import { toast } from 'sonner';

const LeadStatus = ({ status }) => {
  const configs = {
    new: { label: 'New Lead', variant: 'indigo' },
    contacted: { label: 'Contacted', variant: 'warning' },
    demo_scheduled: { label: 'Demo Scheduled', variant: 'indigo' },
    trial_started: { label: 'Trial Started', variant: 'success' },
    paid_customer: { label: 'Paid Customer', variant: 'success' },
    renewal: { label: 'Renewal', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
  };
  const config = configs[status] || configs.new;
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

const LeadsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [note, setNote] = useState('');

  const { data, isLoading } = useGetLeadsQuery({ 
    search: searchTerm, 
    status: statusFilter 
  });
  
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateLead({ id, status }).unwrap();
      toast.success('Lead status updated');
    } catch (err) {
      toast.error('Failed to update lead');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await updateLead({ id: selectedLead._id, note }).unwrap();
      setNote('');
      toast.success('Note added');
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const filterBtns = [
    { label: 'All',           value: '',                count: data?.total || 0 },
    { label: 'New',           value: 'new',             count: data?.leads?.filter(l => l.status === 'new').length || 0 },
    { label: 'Interested',    value: 'contacted',       count: data?.leads?.filter(l => l.status === 'contacted').length || 0 },
    { label: 'Demo',          value: 'demo_scheduled',  count: data?.leads?.filter(l => l.status === 'demo_scheduled').length || 0 },
    { label: 'Trial',         value: 'trial_started',   count: data?.leads?.filter(l => l.status === 'trial_started').length || 0 },
    { label: 'Paid',          value: 'paid_customer',   count: data?.leads?.filter(l => l.status === 'paid_customer').length || 0 },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Lead Management" 
        subtitle="Manage sales inquiries and demo requests" 
      />

      {/* Filters & Search */}
      <Panel className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${superAdminInputClass} pl-11`}
            />
          </div>
          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {filterBtns.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                  ${statusFilter === f.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                {f.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === f.value ? 'bg-white/20' : 'bg-white dark:bg-slate-900 text-slate-500'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Leads Table */}
        <div className="lg:col-span-2">
          <Panel className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lead</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    [1,2,3,4,5].map(i => (
                      <tr key={i}>
                        <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-full" /></td>
                      </tr>
                    ))
                  ) : data?.leads?.length > 0 ? (
                    data.leads.map(lead => (
                      <tr
                        key={lead._id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${selectedLead?._id === lead._id ? 'bg-indigo-500/10' : ''}`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">
                              <Users size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{lead.schoolName || 'Individual'}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{lead.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <LeadStatus status={lead.status} />
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{new Date(lead.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <ChevronRight className={`w-5 h-5 ml-auto transition-transform ${selectedLead?._id === lead._id ? 'text-indigo-600 dark:text-indigo-400 translate-x-1' : 'text-slate-300 dark:text-slate-700'}`} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-24 text-center">
                         <div className="flex flex-col items-center gap-3">
                            <Users size={48} className="text-slate-200 dark:text-slate-800" />
                            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-xs">No Leads Found</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Lead Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedLead ? (
              <motion.div
                key={selectedLead._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Panel className="p-8 border-none shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/40 sticky top-28 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                          <Users size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{selectedLead.name}</h3>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{selectedLead.schoolName || 'Individual'}</p>
                        </div>
                      </div>
                      <select 
                        value={selectedLead.status}
                        onChange={(e) => handleUpdateStatus(selectedLead._id, e.target.value)}
                        className="text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 outline-none text-slate-900 dark:text-white cursor-pointer hover:border-indigo-500 transition-all"
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="demo_scheduled">Demo Scheduled</option>
                        <option value="trial_started">Trial Started</option>
                        <option value="paid_customer">Paid Customer</option>
                        <option value="renewal">Renewal</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Users size={12} /> Contact
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedLead.name}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Phone size={12} /> Phone
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedLead.phone || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <Mail size={12} /> Email Address
                        </p>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{selectedLead.email}</p>
                      </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Inquiry Message</h4>
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                         <p className="text-sm font-bold text-slate-300 leading-relaxed italic">"{selectedLead.message}"</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Notes & Activity</h4>
                      <div className="space-y-3 mb-4">
                        {selectedLead.notes?.map((n, i) => (
                          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-600 dark:text-slate-300">{n}</p>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={handleAddNote} className="space-y-3">
                         <textarea 
                           value={note}
                           onChange={(e) => setNote(e.target.value)}
                           placeholder="Add a private note about this lead..."
                           className="w-full p-4 bg-slate-900 border-2 border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none h-24 font-medium"
                         />
                         <button
                           type="submit"
                           disabled={isUpdating || !note.trim()}
                           className={`p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95`}
                         >
                           {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                         </button>
                      </form>
                    </div>
                  </div>
                </div>
              </Panel>
            </motion.div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 rounded-[2.5rem] border border-slate-800/50 border-dashed">
                 <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600 mb-4">
                   <Users size={32} />
                 </div>
                 <h3 className="text-lg font-black text-white mb-2">Select a lead</h3>
                 <p className="text-slate-500 text-sm font-medium">Choose a lead from the list to view full details and manage the sales process.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LeadsManagement;

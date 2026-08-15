import React, { useState } from 'react';
import { useGetSupportTicketsQuery, useRespondToTicketMutation } from '../../store/superAdminApiSlice';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Loader2,
  Building2,
  User,
  Search,
  Filter,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader, Panel, superAdminInputClass } from '../../components/superadmin/SuperAdminShell';
import { toast } from 'sonner';

const TicketStatus = ({ status }) => {
  const configs = {
    open: { label: 'Open', color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' },
    waiting_for_user: { label: 'Waiting for User', color: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400' },
    resolved: { label: 'Resolved', color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    closed: { label: 'Closed', color: 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-slate-400' },
  };
  const config = configs[status] || configs.open;
  return (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${config.color}`}>
      {config.label}
    </span>
  );
};

const TicketsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  
  const { data, isLoading } = useGetSupportTicketsQuery({
    search: searchTerm,
    status: statusFilter
  });
  
  const [respondToTicket, { isLoading: isResponding }] = useRespondToTicketMutation();

  const handleRespond = async (e, status = null) => {
    e.preventDefault();
    if (!response.trim() && !status) return;

    try {
      await respondToTicket({ 
        id: selectedTicket._id, 
        content: response,
        status: status || 'waiting_for_user'
      }).unwrap();
      setResponse('');
      toast.success('Response sent and status updated');
    } catch (err) {
      toast.error('Failed to send response');
    }
  };

  const filterBtns = [
    { label: 'All',      value: '',           count: data?.total || 0 },
    { label: 'Open',     value: 'open',       count: data?.tickets?.filter(t => t.status === 'open').length || 0 },
    { label: 'Pending',  value: 'in_progress',count: data?.tickets?.filter(t => t.status === 'in_progress').length || 0 },
    { label: 'Resolved', value: 'resolved',   count: data?.tickets?.filter(t => t.status === 'resolved').length || 0 },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Support Dashboard" 
        subtitle="Manage technical and billing support tickets across all tenants" 
      />

      {/* Filters & Search */}
      <Panel className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, subject or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${superAdminInputClass} pl-11`}
            />
          </div>
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
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Panel className="overflow-hidden h-[700px] flex flex-col border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Tickets</h3>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black">{data?.total || 0}</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
              {isLoading ? (
                <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" /></div>
              ) : data?.tickets?.length > 0 ? (
                data.tickets.map(ticket => (
                  <button
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col gap-3 group ${selectedTicket?._id === ticket._id ? 'bg-indigo-500/10' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{ticket.ticketId}</span>
                      <TicketStatus status={ticket.status} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 size={12} className="text-slate-400 dark:text-slate-500" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ticket.school?.name}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-20 text-center flex flex-col items-center gap-2">
                  <MessageSquare className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                  <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs">No tickets found</p>
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Ticket Detail & Interaction */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Panel className="flex flex-col h-[700px] border-none shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/40 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedTicket.school?.name}</span>
                       <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                       <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{selectedTicket.user?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <TicketStatus status={selectedTicket.status} />
                   <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                     Priority: {selectedTicket.priority}
                   </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50 dark:bg-slate-900/10 custom-scrollbar">
                {/* School Inquiry */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                    <User className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="space-y-1 max-w-[85%]">
                    <div className="p-5 rounded-2xl rounded-tl-none bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-sm text-slate-900 dark:text-white leading-relaxed font-bold">{selectedTicket.description}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase ml-1">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Response Thread */}
                {selectedTicket.responses?.map((res, idx) => (
                  <div key={idx} className={`flex gap-4 ${res.user?._id === selectedTicket.user?._id ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${res.user?._id === selectedTicket.user?._id ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' : 'bg-indigo-600 shadow-indigo-500/20'}`}>
                      {res.user?._id === selectedTicket.user?._id ? <User size={20} className="text-slate-400 dark:text-slate-500" /> : <HelpCircle size={20} className="text-white" />}
                    </div>
                    <div className={`space-y-1 max-w-[85%] ${res.user?._id === selectedTicket.user?._id ? '' : 'text-right'}`}>
                      <div className={`p-5 rounded-2xl shadow-sm ${
                        res.user?._id === selectedTicket.user?._id 
                          ? 'rounded-tl-none bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800' 
                          : 'rounded-tr-none bg-indigo-600 text-white border border-indigo-500'
                      }`}>
                        <p className={`text-sm leading-relaxed font-bold ${res.user?._id === selectedTicket.user?._id ? 'text-slate-900 dark:text-white' : 'text-white'}`}>{res.content}</p>
                      </div>
                      <div className="flex items-center gap-2 justify-end px-1">
                        <p className="text-[10px] text-slate-500 font-black uppercase">{new Date(res.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Area */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleRespond} className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response to the school admin..."
                      className="w-full h-32 p-5 bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold"
                    />
                    <div className="absolute right-4 bottom-4 flex items-center gap-2">
                       <button
                         type="button"
                         onClick={(e) => handleRespond(e, 'resolved')}
                         className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                       >
                         Mark Resolved
                       </button>
                       <button
                         type="submit"
                         disabled={isResponding || !response.trim()}
                         className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                       >
                         {isResponding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                       </button>
                    </div>
                  </div>
                </form>
              </div>
            </Panel>
          ) : (
            <div className="h-[700px] flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
               <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                 <MessageSquare size={40} />
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Select a ticket to respond</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">Choose a support request from the list to view the conversation and provide assistance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsManagement;

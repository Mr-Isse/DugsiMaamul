import React, { useState } from 'react';
import { 
  useGetSupportTicketsQuery, 
  useCreateSupportTicketMutation, 
  useRespondToTicketMutation 
} from '../store/adminApiSlice';
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Loader2,
  ChevronRight,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const TicketStatus = ({ status }) => {
  const configs = {
    open: { label: 'Open', color: 'bg-blue-100 text-blue-700', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: Loader2 },
    waiting_for_user: { label: 'Waiting for You', color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
    resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    closed: { label: 'Closed', color: 'bg-slate-100 text-slate-700', icon: XCircle },
  };
  const config = configs[status] || configs.open;
  return (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${config.color}`}>
      {config.label}
    </span>
  );
};

const SupportTickets = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  
  const { data: ticketsData, isLoading } = useGetSupportTicketsQuery();
  const [createTicket, { isLoading: isCreating }] = useCreateSupportTicketMutation();
  const [respondToTicket, { isLoading: isResponding }] = useRespondToTicketMutation();

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await createTicket(data).unwrap();
      toast.success('Support ticket created successfully');
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create ticket');
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;

    try {
      await respondToTicket({ id: selectedTicket._id, content: response }).unwrap();
      setResponse('');
      toast.success('Response sent');
    } catch (err) {
      toast.error('Failed to send response');
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Support Center</h1>
          <p className="text-slate-500 font-medium">Need help? Create a ticket and our team will assist you.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} /> Create New Ticket
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Your Tickets</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" /></div>
              ) : ticketsData?.tickets?.length > 0 ? (
                ticketsData.tickets.map(ticket => (
                  <button
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-all flex flex-col gap-2 ${selectedTicket?._id === ticket._id ? 'bg-indigo-50/50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.ticketId}</span>
                      <TicketStatus status={ticket.status} />
                    </div>
                    <p className="font-bold text-slate-900 line-clamp-1">{ticket.subject}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{ticket.description}</p>
                  </button>
                ))
              ) : (
                <div className="p-10 text-center text-slate-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold">No tickets found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Detail & Chat */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 flex flex-col h-[700px] shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedTicket.subject}</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ticket ID: {selectedTicket.ticketId}</p>
                </div>
                <TicketStatus status={selectedTicket.status} />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {/* Original Message */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm max-w-[80%]">
                    <p className="text-sm text-slate-900 leading-relaxed">{selectedTicket.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-3">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Responses */}
                {selectedTicket.responses?.map((res, idx) => (
                  <div key={idx} className={`flex gap-4 ${res.user?._id === selectedTicket.user ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${res.user?._id === selectedTicket.user ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                      <MessageSquare className={`w-5 h-5 ${res.user?._id === selectedTicket.user ? 'text-indigo-600' : 'text-emerald-600'}`} />
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm max-w-[80%] ${res.user?._id === selectedTicket.user ? 'bg-white border border-slate-100' : 'bg-emerald-600 text-white'}`}>
                      <p className="text-sm leading-relaxed">{res.content}</p>
                      <p className={`text-[10px] font-bold uppercase mt-3 ${res.user?._id === selectedTicket.user ? 'text-slate-400' : 'text-emerald-100'}`}>{new Date(res.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 bg-white rounded-b-[2.5rem]">
                <form onSubmit={handleRespond} className="flex gap-4">
                  <input
                    type="text"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isResponding || !response.trim()}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 h-[700px] flex flex-col items-center justify-center text-center p-12 opacity-40">
              <MessageSquare className="w-20 h-20 mb-6 text-slate-200" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">No Ticket Selected</h2>
              <p className="text-slate-500 font-medium">Select a ticket from the left to view the conversation or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50">
                <h2 className="text-2xl font-black text-slate-900">Create Support Ticket</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Our team will get back to you within 24 hours.</p>
              </div>
              <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                  <input
                    name="subject"
                    required
                    placeholder="Brief summary of the issue"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                    <select name="type" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-xl px-4 py-3 text-sm transition-all outline-none">
                      <option value="general">General Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Issue</option>
                      <option value="feature_request">Feature Request</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                    <select name="priority" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-xl px-4 py-3 text-sm transition-all outline-none">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    placeholder="Provide details about the problem..."
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-xl p-4 text-sm transition-all outline-none resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 className="animate-spin mx-auto" /> : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTickets;

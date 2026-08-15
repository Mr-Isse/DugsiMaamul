import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, Sparkles, Building2, User, ChevronLeft, Phone, Globe } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { buildApiUrl } from '../../utils/apiConfig';

const planLabels = {
  frontend: 'Starter (Frontend Only)',
  full: 'Pro (Full System)',
  mobile: 'Mobile App Plan',
  enterprise: 'Enterprise',
};

const ContactPage = () => {
  const [params] = useSearchParams();
  const selectedPlan = params.get('plan') || '';
  const leadType = params.get('type') || 'contact';
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    country: '',
    message: selectedPlan ? `Interested in: ${planLabels[selectedPlan] || selectedPlan}` : '',
    type: leadType
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(buildApiUrl('/public/leads'), form);
      toast.success(response.data.userMessage || 'Intelligence received. Our specialists will contact you shortly.');
      setForm({ name: '', email: '', phone: '', schoolName: '', country: '', message: '', type: 'contact' });
    } catch (error) {
      console.error('Lead submission error:', error);
      toast.error(error.response?.data?.userMessage || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent min-h-screen text-gray-900 dark:text-white selection:bg-indigo-500/30">
      <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-24">
        {/* Background Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-5xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white mb-12 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Ecosystem
          </Link>

          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-8"
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-6"
                >
                  <Sparkles className="w-4 h-4" /> {form.type === 'demo' ? 'Request a Demo' : 'Let\'s Talk Growth'}
                </motion.div>
                <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[0.95] text-gray-900 dark:text-white">
                  {form.type === 'demo' ? 'See the' : 'Scale your'} <br/>
                  <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">{form.type === 'demo' ? 'Future' : 'Institution'}</span>
                </h1>
                <p className="text-gray-600 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                  {form.type === 'demo' 
                    ? 'Book a personalized walkthrough of the DugsiKabe platform and see how we can transform your school operations.'
                    : 'Request a specialized demo, mobile app architecture quote, or discuss enterprise-level on-premise deployments.'
                  }
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-5 p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-cyan-500/10 flex items-center justify-center border border-indigo-100 dark:border-cyan-500/20 shrink-0">
                    <Mail className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Direct Channel</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">hello@dugsihub.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5 p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shrink-0">
                    <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Expert Support</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Sales & Architecture</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-600/5 dark:bg-cyan-500/5 blur-[100px] rounded-full -z-10" />
              <form
                onSubmit={handleSubmit}
                className="space-y-6 p-8 sm:p-10 rounded-[3rem] bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 backdrop-blur-xl shadow-2xl"
              >
                {selectedPlan && (
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-100 dark:border-cyan-500/20 text-indigo-600 dark:text-cyan-300 text-xs font-black uppercase tracking-widest text-center">
                    Project Context: {planLabels[selectedPlan] || selectedPlan}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        placeholder="Your Name"
                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600/30 dark:focus:border-cyan-500/30 focus:bg-white dark:focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600/30 dark:focus:border-cyan-500/30 focus:bg-white dark:focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        placeholder="Phone Number"
                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600/30 dark:focus:border-cyan-500/30 focus:bg-white dark:focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>

                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        placeholder="School Name"
                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600/30 dark:focus:border-cyan-500/30 focus:bg-white dark:focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                        value={form.schoolName}
                        onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      placeholder="Country"
                      className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600/30 dark:focus:border-cyan-500/30 focus:bg-white dark:focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                    />
                  </div>

                  <textarea
                    rows={4}
                    placeholder={form.type === 'demo' ? 'Tell us about your school size and requirements for the demo...' : 'Tell us about your school goals...'}
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600/30 dark:focus:border-cyan-500/30 focus:bg-white dark:focus:bg-white/10 rounded-3xl p-6 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none resize-none"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group flex items-center justify-center gap-3 py-5 rounded-2xl bg-indigo-600 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-indigo-600 text-white font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 dark:shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                  {loading ? 'Processing...' : (form.type === 'demo' ? 'Request Demo' : 'Submit Intelligence')}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

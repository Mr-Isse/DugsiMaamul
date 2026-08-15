import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useParentLoginMutation } from '../../store/adminApiSlice';
import { setCredentials } from '../../store/authSlice';
import { useAppToast } from '../../hooks/useAppToast';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, Hash, Lock, ArrowRight, Loader2, ChevronLeft, ShieldCheck, Sparkles } from 'lucide-react';

const ParentLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierType, setIdentifierType] = useState('email');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showError, showSuccess } = useAppToast();
  const [parentLogin, { isLoading }] = useParentLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo?.role === 'parent') {
      navigate('/parent');
    }
  }, [navigate, userInfo]);

  const detectType = (val) => {
    if (val.includes('@')) return 'email';
    if (/^\d+$/.test(val)) return 'phone';
    return 'customId';
  };

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    setIdentifier(val);
    setIdentifierType(detectType(val));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      showError('Please enter your credentials');
      return;
    }

    const payload = { password };
    const type = detectType(identifier);
    if (type === 'email') payload.email = identifier.toLowerCase();
    else if (type === 'phone') payload.phone = identifier;
    else payload.customId = identifier;

    try {
      const res = await parentLogin(payload).unwrap();
      dispatch(setCredentials(res));
      showSuccess('Welcome back!');
      navigate('/parent');
    } catch (err) {
      showError(err);
    }
  };

  const identifierIcon = identifierType === 'email' ? Mail : identifierType === 'phone' ? Phone : Hash;
  const IdentifierIcon = identifierIcon;

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-emerald-500/30">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-slate-900 to-slate-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="relative z-10 max-w-lg text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/20">
            <Users className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white tracking-tight mb-6">
            Stay Connected with Your <span className="text-emerald-400">Child's Journey</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-slate-400 text-lg leading-relaxed">
            Access attendance, results, fees, and school announcements — all in one place.
          </motion.p>
          <div className="mt-12 grid grid-cols-2 gap-6">
            {[
              { label: 'Track Attendance', icon: ShieldCheck },
              { label: 'View Results', icon: Sparkles },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm">
                <item.icon className="w-5 h-5 text-emerald-400" />
                {item.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-10 transition-colors font-bold text-sm uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Parent Sign In</h1>
            <p className="text-slate-500 mt-2 font-medium">Access your child's school portal</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Email, Phone or Student ID
              </label>
              <div className="relative group">
                <IdentifierIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="text"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  required
                  placeholder="parent@school.com"
                  className="w-full bg-white/5 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-5 rounded-2xl hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-600 text-sm mt-8">
            School administrator?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              Staff Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentLogin;

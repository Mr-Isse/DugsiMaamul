import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useLoginMutation,
  useVerify2FAMutation,
  useResend2FAMutation,
} from '../../store/adminApiSlice';
import { setCredentials } from '../../store/authSlice';
import { toast } from 'sonner';
import { Globe, ShieldCheck, Mail, Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const [verify2FA, { isLoading: isVerifying }] = useVerify2FAMutation();
  const [resend2FA, { isLoading: isResending }] = useResend2FAMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.role === 'superadmin') {
      navigate('/admin');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();

      if (res.requires2FA) {
        setTempUserId(res.userId);
        setMaskedEmail(res.email);
        setShowOTP(true);
        toast.success('Verification code sent to your email');
        return;
      }

      if (res.role !== 'superadmin') {
        toast.error('Access denied. Super Admin credentials required.');
        return;
      }
      dispatch(setCredentials({ ...res }));
      navigate('/admin');
      toast.success('Platform access granted');
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Authentication failed');
    }
  };

  const verifyOTPHandler = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    try {
      const res = await verify2FA({ 
        userId: tempUserId, 
        otp 
      }).unwrap();

      if (res.role !== 'superadmin') {
        toast.error('Access denied. Super Admin credentials required.');
        return;
      }

      dispatch(setCredentials({ ...res }));
      toast.success('Identity verified. Access granted.');
      navigate('/admin');
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Verification failed');
    }
  };

  const resendOTPHandler = async () => {
    try {
      await resend2FA({ userId: tempUserId }).unwrap();
      toast.success('A new code has been sent');
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase">
              Dugsi<span className="text-indigo-400">Hub</span>
            </span>
          </Link>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {showOTP ? 'Security Verification' : 'Platform Gateway'}
          </h2>
          <p className="mt-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
            {showOTP ? `Enter code sent to ${maskedEmail}` : 'Super Admin Control Center'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {!showOTP ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
                onSubmit={submitHandler}
              >
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Security Identity
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border-2 border-transparent focus:border-indigo-500/30 focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 transition-all outline-none"
                      placeholder="admin@dugsihub.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Access Token
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border-2 border-transparent focus:border-indigo-500/30 focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl hover:bg-indigo-50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Unlock Control Center <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
                onSubmit={verifyOTPHandler}
              >
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-white/5 border-2 border-transparent focus:border-indigo-500/30 focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 transition-all outline-none tracking-[1em] text-center font-bold"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl hover:bg-indigo-50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify Identity <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={resendOTPHandler}
                    disabled={isResending}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    {isResending ? 'Sending...' : "Resend Code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOTP(false)}
                    className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Encrypted Session
            </div>
          </div>
        </motion.div>

        <p className="mt-10 text-center text-xs font-bold text-slate-600 uppercase tracking-widest">
          Unauthorized access is strictly prohibited
        </p>
      </div>
    </div>
  );
};

export default SuperAdminLogin;

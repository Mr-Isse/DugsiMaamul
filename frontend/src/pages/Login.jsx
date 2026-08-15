import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useLoginMutation,
  useVerify2FAMutation,
  useResend2FAMutation,
} from '../store/adminApiSlice';
import { setCredentials } from '../store/authSlice';
import { useAppToast } from '../hooks/useAppToast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [isBranchLogin, setIsBranchLogin] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showError, showSuccess } = useAppToast();

  const [login, { isLoading }] = useLoginMutation();
  const [verify2FA, { isLoading: isVerifying }] = useVerify2FAMutation();
  const [resend2FA, { isLoading: isResending }] = useResend2FAMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'superadmin') {
        navigate('/admin');
      } else if (
        (userInfo.role === 'schooladmin' || userInfo.role === 'school_admin' || userInfo.role === 'admin') &&
        userInfo.schoolProfileCompleted !== true
      ) {
        navigate('/school-profile-setup');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();

      if (res.requires2FA) {
        setTempUserId(res.userId);
        setMaskedEmail(res.email);
        setIsBranchLogin(!!res.isBranchLogin);
        setShowOTP(true);
        showSuccess('Verification code sent to your email');
        return;
      }

      // Store complete user data including RBAC information
      dispatch(setCredentials({ 
        ...res,
        // Ensure RBAC fields are stored even if backend doesn't return them
        permissions: res.permissions || [],
        rbacRole: res.rbacRole || null,
        permissionOverrides: res.permissionOverrides || []
      }));
      
      showSuccess('Signed in successfully');
      
      handleNavigation(res);
    } catch (err) {
      showError(err);
    }
  };

  const verifyOTPHandler = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      showError('Please enter the 6-digit code');
      return;
    }

    try {
      const res = await verify2FA({ 
        userId: tempUserId, 
        otp, 
        isBranchLogin 
      }).unwrap();

      dispatch(setCredentials({ 
        ...res,
        permissions: res.permissions || [],
        rbacRole: res.rbacRole || null,
        permissionOverrides: res.permissionOverrides || []
      }));
      
      showSuccess('Identity verified successfully');
      handleNavigation(res);
    } catch (err) {
      showError(err);
    }
  };

  const resendOTPHandler = async () => {
    try {
      await resend2FA({ userId: tempUserId, isBranchLogin }).unwrap();
      showSuccess('A new code has been sent');
    } catch (err) {
      showError(err);
    }
  };

  const handleNavigation = (user) => {
    if (user.role === 'superadmin') {
      navigate('/admin');
    } else if (
      (user.role === 'schooladmin' || user.role === 'school_admin' || user.role === 'admin') && 
      user.schoolProfileCompleted !== true
    ) {
      navigate('/school-profile-setup');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-cyan-500/30">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
        
        <div className="relative z-10 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-cyan-500/20"
          >
            <Building2 className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white tracking-tight mb-6"
          >
            Empowering Education through <span className="text-cyan-400">Innovation</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 text-lg leading-relaxed"
          >
            Sign in to your school's dedicated command center. Manage students, 
            finance, and academic performance with precision.
          </motion.p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            {[
              { label: 'Secure Access', icon: ShieldCheck },
              { label: 'Real-time Sync', icon: Sparkles },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm"
              >
                <item.icon className="w-5 h-5 text-cyan-400" />
                {item.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-10 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {showOTP ? 'Two-Factor Auth' : 'Sign In'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {showOTP 
                ? `Enter the 6-digit code sent to ${maskedEmail}` 
                : 'Access your school administration dashboard'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!showOTP ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={submitHandler}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Professional Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@school.com"
                      className="w-full bg-white/5 border-2 border-transparent focus:border-cyan-500/30 focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Secure Password
                    </label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border-2 border-transparent focus:border-cyan-500/30 focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black py-5 rounded-2xl hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Enter Dashboard <ArrowRight className="w-5 h-5" />
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
                onSubmit={verifyOTPHandler}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Verification Code
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      placeholder="000000"
                      className="w-full bg-white/5 border-2 border-transparent focus:border-cyan-500/30 focus:bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 transition-all outline-none tracking-[1em] text-center font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black py-5 rounded-2xl hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify Code <ShieldCheck className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={resendOTPHandler}
                    disabled={isResending}
                    className="text-slate-400 hover:text-cyan-400 text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOTP(false)}
                    className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
             <p className="text-slate-500 text-sm font-medium">
                Not a member yet?{' '}
                <Link to="/pricing" className="text-cyan-400 font-black hover:text-cyan-300 transition-colors">
                  Explore Plans
                </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

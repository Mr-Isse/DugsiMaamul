import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, User, ArrowLeft } from 'lucide-react';
import { setCredentials } from '../../store/authSlice';
import { checkSuperAdminExists, superAdminRegister } from '../../services/superAdminApi';
import { toast } from 'sonner';

const SuperAdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo?.role === 'superadmin') navigate('/admin');
  }, [userInfo, navigate]);

  useEffect(() => {
    checkSuperAdminExists()
      .then((res) => {
        if (res.data.exists) {
          toast.error('Super admin already exists. Please login.');
          navigate('/admin/login');
        }
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await superAdminRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      dispatch(
        setCredentials({
          ...data,
          role: 'superadmin',
          token: data.token,
          name: data.name || formData.name,
        })
      );
      toast.success('Super admin account created');
      navigate('/admin');
    } catch (error) {
      toast.error(
        error.response?.data?.userMessage ||
          error.response?.data?.message ||
          'Registration failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/admin/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Bootstrap DugsiKabe</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="email"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl"
            >
              {isLoading ? 'Creating...' : 'Create Super Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminRegister;

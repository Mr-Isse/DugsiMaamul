import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Layers,
  Bell,
  Wallet,
  FileBarChart,
  Brain,
  Globe2,
  Lock,
  Zap,
} from 'lucide-react';

const services = [
  { icon: Layers, title: 'School Management System', desc: 'Central hub for daily operations.' },
  { icon: Globe2, title: 'Multi-Tenant SaaS', desc: 'One codebase, many schools via tenantId.' },
  { icon: Wallet, title: 'Finance & Payments', desc: 'Fees, monthly payments, and reporting.' },
  { icon: FileBarChart, title: 'Exams & Reports', desc: 'Marks, halls, and analytics.' },
  { icon: Bell, title: 'Notifications', desc: 'Announcements and parent alerts.' },
  { icon: Brain, title: 'AI-Ready Infrastructure', desc: 'Built for future intelligent insights.' },
  { icon: Lock, title: 'Enterprise Security', desc: 'RBAC, JWT, tenant isolation, rate limits.' },
  { icon: Zap, title: 'Performance', desc: 'Lazy loading, caching, and optimized APIs.' },
];

const PlatformPage = () => (
  <div className="px-4 sm:px-6 lg:px-8 py-20 min-h-screen bg-transparent transition-colors duration-200">
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">The DugsiKabe Platform</h1>
        <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          A single domain, one backend, three experiences: marketing, super admin control center,
          and school operations dashboard.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="p-8 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-indigo-600 dark:hover:border-indigo-500/40 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <s.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white text-base mb-3 uppercase tracking-tight">{s.title}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-[3rem] border border-gray-100 dark:border-white/10 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-indigo-950/80 p-10 md:p-20 text-center shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Mobile app per school</h2>
        <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto mb-10 text-lg font-medium">
          Expo-powered white-label apps with your logo, colors, and tenantId — students,
          teachers, and parents stay connected.
        </p>
        <Link
          to="/pricing"
          className="inline-flex px-10 py-4 rounded-2xl bg-indigo-600 dark:bg-white text-white dark:text-slate-950 font-black hover:scale-105 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
        >
          See Mobile App Plan
        </Link>
      </div>
    </div>
  </div>
);

export default PlatformPage;

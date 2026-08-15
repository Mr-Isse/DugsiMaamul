import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAvailablePlansQuery } from '../../store/adminApiSlice';
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  BookOpen,
  GitBranch,
  HardDrive,
  MessageSquare,
  Mail,
  Zap,
  Shield,
  BarChart3,
  Smartphone,
  Globe,
  Headphones,
  Star,
  Loader2,
} from 'lucide-react';

const HARDCODED_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    code: 'STARTER',
    tagline: 'Perfect for small schools',
    monthlyPrice: 49,
    yearlyPrice: 470,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/10',
    isPopular: false,
    limits: { students: 500, teachers: 20, branches: 1, storage: 5, sms: 200, email: 2000 },
    features: [
      { text: '500 Students', included: true },
      { text: '20 Teachers', included: true },
      { text: '1 Branch', included: true },
      { text: '5 GB Storage', included: true },
      { text: 'Attendance Management', included: true },
      { text: 'Fee & Payments', included: true },
      { text: 'Exam & Results', included: true },
      { text: 'Email Support', included: true },
      { text: 'Mobile Apps', included: false },
      { text: 'Multi-Branch Management', included: false },
      { text: 'Advanced Analytics', included: false },
      { text: 'Priority Support', included: false },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/contact?plan=starter',
  },
  {
    id: 'professional',
    name: 'Professional',
    code: 'PROFESSIONAL',
    tagline: 'For growing institutions',
    monthlyPrice: 129,
    yearlyPrice: 1238,
    color: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-500/50',
    glowColor: 'shadow-indigo-500/20',
    isPopular: true,
    limits: { students: 2000, teachers: 100, branches: 5, storage: 25, sms: 1000, email: 10000 },
    features: [
      { text: '2,000 Students', included: true },
      { text: '100 Teachers', included: true },
      { text: '5 Branches', included: true },
      { text: '25 GB Storage', included: true },
      { text: 'Attendance Management', included: true },
      { text: 'Fee & Payments', included: true },
      { text: 'Exam & Results', included: true },
      { text: 'Priority Email & Chat Support', included: true },
      { text: 'Mobile Apps (Parent, Student, Teacher)', included: true },
      { text: 'Multi-Branch Management', included: true },
      { text: 'Advanced Analytics', included: false },
      { text: 'Dedicated Account Manager', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/contact?plan=professional',
  },
  {
    id: 'business',
    name: 'Business',
    code: 'BUSINESS',
    tagline: 'For large school networks',
    monthlyPrice: 299,
    yearlyPrice: 2870,
    color: 'from-violet-600 to-pink-600',
    borderColor: 'border-violet-500/30',
    glowColor: 'shadow-violet-500/10',
    isPopular: false,
    limits: { students: 10000, teachers: 500, branches: 20, storage: 100, sms: 5000, email: 50000 },
    features: [
      { text: '10,000 Students', included: true },
      { text: '500 Teachers', included: true },
      { text: '20 Branches', included: true },
      { text: '100 GB Storage', included: true },
      { text: 'Attendance Management', included: true },
      { text: 'Fee & Payments', included: true },
      { text: 'Exam & Results', included: true },
      { text: 'Priority Email & Chat Support', included: true },
      { text: 'Mobile Apps (Parent, Student, Teacher)', included: true },
      { text: 'Multi-Branch Management', included: true },
      { text: 'Advanced Analytics Dashboard', included: true },
      { text: 'Dedicated Account Manager', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact?plan=business',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    code: 'ENTERPRISE',
    tagline: 'Unlimited & fully custom',
    monthlyPrice: null,
    yearlyPrice: null,
    color: 'from-slate-700 to-slate-900',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/10',
    isPopular: false,
    limits: { students: -1, teachers: -1, branches: -1, storage: -1, sms: -1, email: -1 },
    features: [
      { text: 'Unlimited Students', included: true },
      { text: 'Unlimited Teachers', included: true },
      { text: 'Unlimited Branches', included: true },
      { text: 'Unlimited Storage', included: true },
      { text: 'All Features Included', included: true },
      { text: 'Custom Domain & Branding', included: true },
      { text: 'Dedicated Cloud Infrastructure', included: true },
      { text: '24/7 Priority Support & SLA', included: true },
      { text: 'Custom Mobile App Branding', included: true },
      { text: 'On-Premise Deployment Options', included: true },
      { text: 'Full Analytics & Reporting', included: true },
      { text: 'Dedicated Account Manager + Engineer', included: true },
    ],
    cta: 'Talk to Sales',
    ctaLink: '/contact?plan=enterprise',
  },
];

const FEATURE_ICONS = {
  students: Users,
  teachers: BookOpen,
  branches: GitBranch,
  storage: HardDrive,
};

const ALL_FEATURES_COMPARISON = [
  { category: 'Capacity', items: [
    { name: 'Students', starter: '500', professional: '2,000', business: '10,000', enterprise: 'Unlimited' },
    { name: 'Teachers', starter: '20', professional: '100', business: '500', enterprise: 'Unlimited' },
    { name: 'Branches', starter: '1', professional: '5', business: '20', enterprise: 'Unlimited' },
    { name: 'Storage', starter: '5 GB', professional: '25 GB', business: '100 GB', enterprise: 'Unlimited' },
  ]},
  { category: 'Core Modules', items: [
    { name: 'Students & Enrollment', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Online Admissions / Registration', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Attendance (Students)', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Attendance (Teachers)', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Exams & Results', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Fee & Payment Management', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Timetable / Schedule', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Announcements & Events', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Library Management', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Hostel Management', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Transport Management', starter: false, professional: false, business: true, enterprise: true },
  ]},
  { category: 'Mobile & Access', items: [
    { name: 'Parent Mobile App', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Student Mobile App', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Teacher Mobile App', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Push Notifications', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Custom App Branding', starter: false, professional: false, business: false, enterprise: true },
  ]},
  { category: 'Analytics & Reports', items: [
    { name: 'Basic Reports', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Finance Reports', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Advanced Analytics Dashboard', starter: false, professional: false, business: true, enterprise: true },
    { name: 'Data Export (CSV / Excel)', starter: true, professional: true, business: true, enterprise: true },
  ]},
  { category: 'Support & Infrastructure', items: [
    { name: 'Email Support', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Live Chat Support', starter: false, professional: true, business: true, enterprise: true },
    { name: '24/7 Priority Support + SLA', starter: false, professional: false, business: false, enterprise: true },
    { name: 'Dedicated Account Manager', starter: false, professional: false, business: true, enterprise: true },
    { name: 'Custom Domain', starter: false, professional: false, business: false, enterprise: true },
    { name: 'On-Premise Deployment', starter: false, professional: false, business: false, enterprise: true },
    { name: 'Dedicated Cloud Infrastructure', starter: false, professional: false, business: false, enterprise: true },
  ]},
];

const CheckCell = ({ val }) => {
  if (val === true) return (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Check className="w-3.5 h-3.5 text-emerald-500" />
      </div>
    </div>
  );
  if (val === false) return (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
        <X className="w-3.5 h-3.5 text-rose-500" />
      </div>
    </div>
  );
  return <span className="text-sm font-black text-slate-900 dark:text-slate-100">{val}</span>;
};

const PricingPage = () => {
  const [yearly, setYearly] = useState(false);
  const { data: apiPlansRes, isLoading } = useGetAvailablePlansQuery();
  const apiPlans = apiPlansRes?.data || [];

  // Merge API plans with UI metadata
  const plansToDisplay = apiPlans.length > 0 ? apiPlans.map((apiPlan, index) => {
    const basePlan = HARDCODED_PLANS.find(p => p.code === apiPlan.code) || HARDCODED_PLANS[index % HARDCODED_PLANS.length];
    
    // Priority features requested by user for card display
    const PRIORITY_CODES = [
      'students', 'teachers', 'classes', 'schedules', 'attendance', 
      'exams', 'exam-halls', 'parent-app', 'teacher-app', 'student-app', 
      'announcements', 'events', 'website', 'reports', 'certificates', 
      'branches', 'roles', 'permissions', 'finance', 'analytics'
    ];

    const features = apiPlan.features || [];
    const filteredFeatures = features.filter(f => PRIORITY_CODES.includes(f.code));

    return {
      ...basePlan,
      id: apiPlan._id,
      name: apiPlan.name,
      code: apiPlan.code,
      monthlyPrice: apiPlan.monthlyPrice,
      yearlyPrice: apiPlan.yearlyPrice,
      isPopular: apiPlan.isRecommended,
      limits: apiPlan.limits,
      features: (filteredFeatures.length > 0 ? filteredFeatures : features).map(f => ({ text: f.name, included: f.included, code: f.code })),
      ctaLink: `/contact?plan=${apiPlan.code.toLowerCase()}`
    };
  }) : HARDCODED_PLANS;

  // Build dynamic feature comparison
  const dynamicComparison = [];
  if (apiPlans.length > 0) {
    // Group features by category (we can't easily get category from public API without registry)
    // But we can just use the flat list or hardcode categories for display
    const categories = [
      { name: 'Core Modules', codes: ['students', 'teachers', 'parents', 'classes', 'subjects', 'sections'] },
      { name: 'Academic', codes: ['attendance', 'schedules', 'exams', 'results', 'exam-halls', 'certificates'] },
      { name: 'Mobile Apps', codes: ['parent-app', 'student-app', 'teacher-app'] },
      { name: 'Communication', codes: ['announcements', 'notifications', 'sms', 'email'] },
      { name: 'Management', codes: ['branches', 'roles', 'permissions', 'finance'] },
      { name: 'Reports & Analytics', codes: ['reports', 'analytics', 'academic-reports', 'attendance-reports', 'financial-reports', 'student-reports'] },
    ];

    categories.forEach(cat => {
      const items = cat.codes.map(code => {
        const item = { name: code.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') };
        apiPlans.forEach(plan => {
          const feature = plan.features.find(f => f.code === code);
          item[plan.code.toLowerCase()] = feature ? feature.included : false;
        });
        return item;
      });
      dynamicComparison.push({ category: cat.name, items });
    });
  }

  const displayLimit = (val, key) => {
    if (val === -1 || val === 999999) return 'Unlimited';
    if (!val && val !== 0) return '0';
    if (key === 'storage') {
      if (val >= 1024 && val % 1024 === 0) return `${(val / 1024)} GB`;
      return `${val} MB`;
    }
    return val.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen text-gray-900 dark:text-white selection:bg-indigo-500/30 transition-colors duration-200">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 dark:bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/5 dark:bg-violet-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none text-gray-900 dark:text-white">
            Plans for every<br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
              school size
            </span>
          </h1>
          <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            Start with a 14-day free trial on any plan. No credit card required.
            Scale seamlessly as your institution grows.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                !yearly ? 'bg-white dark:bg-white text-slate-900 shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                yearly ? 'bg-white dark:bg-white text-slate-900 shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-32">
          {plansToDisplay.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative flex flex-col rounded-[2rem] border p-6 transition-all duration-500 bg-white dark:bg-[#1e293b] border-gray-100 dark:border-slate-800 shadow-xl dark:shadow-2xl ${
                plan.isPopular ? 'ring-2 ring-indigo-500 shadow-indigo-500/10' : 'shadow-slate-200/50 dark:shadow-none'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Icon */}
              <div className={`w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/5 text-blue-400`}>
                <Building2 className="w-6 h-6" />
              </div>

              {/* Name & Tagline */}
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">{plan.tagline}</p>
              <h3 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">{plan.name}</h3>

              {/* Pricing */}
              <div className="mb-6 min-h-[60px] flex items-end">
                {plan.monthlyPrice !== null && plan.monthlyPrice !== undefined ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-slate-900 dark:text-white">
                        ${yearly && plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                      </span>
                      <span className="text-slate-500 font-bold text-base">/mo</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-black text-amber-500">Custom</span>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">Tailored to your needs</p>
                  </div>
                )}
              </div>

              {/* Limit Highlights */}
              <div className="grid grid-cols-2 gap-2.5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
                {[
                  { icon: Users, key: 'students', label: 'Students' },
                  { icon: BookOpen, key: 'teachers', label: 'Teachers' },
                  { icon: GitBranch, key: 'branches', label: 'Branches' },
                  { icon: HardDrive, key: 'storage', label: 'Storage' },
                ].map(({ icon: Icon, key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 truncate">
                      {displayLimit(plan.limits?.[key], key)} {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {plan.features.map((f) => (
                  <li key={f.text} className={`flex items-start justify-between gap-3 text-[10px] font-bold ${f.included ? 'text-slate-600 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600 line-through'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                        f.included ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                      }`}>
                        {f.included
                          ? <Check className="w-2 h-2 text-emerald-500 dark:text-emerald-400" />
                          : <X className="w-2 h-2 text-rose-500" />
                        }
                      </div>
                      <span className="leading-tight">{f.text}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={plan.ctaLink}
                id={`plan-cta-${plan.id}`}
                className={`block text-center py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                  plan.isPopular
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98]'
                }`}
              >
                {plan.cta === 'Start Free Trial' ? 'Register' : plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase">Full Feature Comparison</h2>
            <p className="text-gray-500 dark:text-slate-400">See exactly what's included in each plan</p>
          </div>

          <div className="overflow-x-auto rounded-[2rem] border border-gray-100 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/8">
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest w-1/3">Feature</th>
                  {plansToDisplay.map(p => (
                    <th key={p.id} className={`px-4 py-5 text-center text-xs font-black uppercase tracking-widest ${
                      p.isPopular ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-400'
                    }`}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(dynamicComparison.length > 0 ? dynamicComparison : ALL_FEATURES_COMPARISON).map((category) => (
                  <React.Fragment key={category.category}>
                    <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                      <td colSpan={plansToDisplay.length + 1} className="px-6 py-4 text-[10px] font-black text-indigo-600 dark:text-slate-500 uppercase tracking-widest border-y border-slate-100 dark:border-white/5">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, idx) => (
                      <tr key={item.name} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{item.name}</td>
                        {plansToDisplay.map(plan => (
                          <td key={plan.id} className={`px-4 py-4 text-center border-l border-slate-50 dark:border-white/5 ${plan.isPopular ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}>
                            <CheckCell val={item[plan.code.toLowerCase()] || item[plan.id]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-100 dark:border-white/10">
                <tr className="bg-slate-50/30 dark:bg-transparent">
                  <td className="px-6 py-8"></td>
                  {plansToDisplay.map((p) => (
                    <td key={p.id} className="px-4 py-8 text-center border-l border-slate-50 dark:border-white/5">
                      <Link
                        to={p.ctaLink}
                        className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          p.isPopular
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-105'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {p.cta === 'Start Free Trial' ? 'Register' : p.cta}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.section>

        {/* Infrastructure Features */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase">Built for Modern Schools</h2>
            <p className="text-gray-500 dark:text-slate-400">Every plan includes enterprise-grade infrastructure</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Enterprise Security', desc: 'RBAC, JWT Auth, and bank-grade encryption on every tier.' },
              { icon: Zap, title: 'Multi-Tenant Isolation', desc: 'Complete data isolation between schools. No leakage, ever.' },
              { icon: BarChart3, title: 'Real-time Reports', desc: 'Instant attendance, finance, and academic analytics.' },
              { icon: Smartphone, title: 'Mobile Ready', desc: 'Native apps for parents, students, and teachers.' },
              { icon: Globe, title: 'Multi-Language', desc: 'Supports Arabic, English, Somali, and more.' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'Human support available via chat, email, and phone.' },
              { icon: GitBranch, title: 'Multi-Branch', desc: 'Manage unlimited branches from a single dashboard.' },
              { icon: BarChart3, title: 'Audit Logs', desc: 'Every action is tracked for compliance and accountability.' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-indigo-200 dark:hover:border-white/15 transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                  <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">{item.title}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[3rem] border border-gray-100 dark:border-white/8 bg-slate-50 dark:bg-gradient-to-br dark:from-indigo-500/10 dark:to-violet-500/10 p-12 lg:p-20 text-center shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            14-Day Free Trial
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-slate-900 dark:text-white">
            Ready to transform<br />your school?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Join hundreds of schools using DugsiKabe to manage their institution efficiently.
            Start your free trial today — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact?plan=professional"
              id="pricing-start-trial-cta"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              id="pricing-contact-sales-cta"
              className="px-8 py-4 bg-white dark:bg-white/8 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-white/15 transition-all shadow-sm dark:shadow-none"
            >
              Talk to Sales
            </Link>
          </div>
          <p className="text-slate-500 dark:text-slate-600 text-xs mt-8 font-medium">
            No credit card required &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; Setup in minutes
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;

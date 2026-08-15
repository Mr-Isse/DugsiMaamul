import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  BarChart3,
  Smartphone,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe,
  Database,
  Lock,
  Layout,
  Zap,
} from 'lucide-react';

const stats = [
  { label: 'Dugsiyo la diyaariyey', value: '500+' },
  { label: 'Ardayda la maamulo', value: '1M+' },
  { label: 'Uptime SLA', value: '99.9%' },
  { label: 'Wadamada', value: '12+' },
];

const features = [
  { 
    icon: Users, 
    title: 'Multi-Tenant Management', 
    desc: 'Complete profiles, classes, and roles with total tenant isolation for security.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  { 
    icon: BarChart3, 
    title: 'Advanced Analytics', 
    desc: 'Real-time attendance tracking, exam results, and financial report cards.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10'
  },
  { 
    icon: Shield, 
    title: 'Enterprise Security', 
    desc: 'JWT authentication, role-based access control, and encrypted data storage.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10'
  },
  { 
    icon: Smartphone, 
    title: 'White-Label Mobile App', 
    desc: 'Fully branded Expo apps for your school — available on Android & iOS.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  },
];

const faqs = [
  { q: "Ma isticmaali karnaa oo kaliya dashboard-ka?", a: "Haa! Xeeladaha Starter iyo Pro-na waxay kuu oggolaanayaan isticmaalka dashboard-ka web-ka aduunka heerka laanta iyada oo aan u baahnayn app mobile." },
  { q: "Ma kala sooc baa xogteena dugsiga u jirta?", a: "Hubaal. Dugsimaamul waxay isticmaashaa qaab adag oo multi-tenant ah halkaa xogta Dugsiga kasta ay ku kala soocantahay iyada oo loo isticmaalayo aqoonsiyeyaasha tenant gaar ah." },
  { q: "Intee le'eg ayuu qaataa gaadhsiinta app-ka mobile-ka?", a: "Apps-yada mobile-ka ee calaamadaysan waxaa badanaa diyaar u noqon kara dib u eegista gudaha 7-14 maalmood oo shaqo ka dib marka aad heshid xogta calaamadaada." },
  { q: "Ma taageertaan domains-ka gaarka ah?", a: "Haa, qorshahayaga Enterprise wuxuu ku jiraa taageerada domain-ka gaarka ah (tusaale, portal.dugsiyadaada.com) iyo kaabayaasha u gaar ah." },
];

const LandingPage = () => (
  <div className="bg-transparent min-h-screen selection:bg-indigo-500/30 transition-colors duration-200">
    {/* Hero Section */}
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-24 pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-white to-white dark:from-indigo-900/30 dark:via-slate-950 dark:to-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/5 dark:bg-cyan-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="relative max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4" /> Nidaamka Maareynta Dugsiga ee Casriga ah
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white tracking-tight max-w-5xl mx-auto leading-[0.95] mb-8">
            Nidaamka Maareynta{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Dugsimaamul
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Dugsimaamul waa platform premium ah oo multi-tenant SaaS ah oo xoojisa dugsiyo 
            oo leh dashboard-yo heerka shirkadaha, qalab maaliyadeed, iyo ecosystems-ka mobile-ka calaamadaysan.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/pricing"
              className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-indigo-600 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-indigo-600 text-white font-bold shadow-2xl shadow-indigo-200 dark:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full" />
              Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/platform"
              className="inline-flex items-center justify-center px-10 py-5 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-white/5 backdrop-blur-sm transition-all"
            >
              Explore Platform
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Preview Component */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-24 relative max-w-6xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent z-10" />
          <div className="relative rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/50 p-2 overflow-hidden shadow-2xl shadow-indigo-100 dark:shadow-cyan-500/10">
            <div className="rounded-2xl overflow-hidden border border-gray-50 dark:border-white/5 aspect-[16/9] relative group bg-gray-100 dark:bg-slate-800">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80" 
                alt="School Management Dashboard"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = "https://placehold.co/1200x675/f8fafc/64748b?text=Interactive+Dashboard+Preview";
                }}
              />
              <div className="absolute inset-0 bg-indigo-600/10 dark:bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <span className="px-6 py-3 rounded-xl bg-white/80 dark:bg-white/10 border border-indigo-100 dark:border-white/20 text-indigo-600 dark:text-white font-black backdrop-blur-xl shadow-lg">
                   Experience the Interface
                 </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Features Grid */}
    <section className="py-32 px-4 border-t border-gray-100 dark:border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[100px] -z-10" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Dhammaan waxa Dugsigaagu u baahan yahay</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium">
            Dooro dashboard xooggan oo web ah ama bilow app-kaaga mobile-ka calaamadaysan.
            Dugsimaamul wuxuu wata koboca Dugsigaaga.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-indigo-600/30 dark:hover:border-cyan-500/40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all duration-500 shadow-sm"
            >
              <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-7 h-7 ${f.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* App Ecosystem Section */}
    <section className="py-32 px-4 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-indigo-600 dark:text-cyan-400 font-black uppercase tracking-[0.2em] text-xs mb-4 block">Mobile Ecosystem</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
              A Branded App for <br/> 
              <span className="text-indigo-600">Your Institution</span>
            </h2>
            <div className="space-y-6">
              {[
                { icon: Smartphone, t: 'Android & iOS', d: 'Apps-yada asalka ah ee la daabacay iyada oo laga bilaabayo aqoonsigaaga Dugsiga.' },
                { icon: Zap, t: 'Push Notifications', d: 'Instant alerts for parents about attendance & fees.' },
                { icon: Lock, t: 'Secure Access', d: 'Role-based login for students, parents, and staff.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-5">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                    <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{item.t}</h4>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/pricing" className="inline-flex mt-10 items-center gap-2 text-white font-black px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all">
              View Mobile Plans <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600/10 dark:bg-cyan-500/20 blur-[100px] rounded-full -z-10" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[9/19] max-w-[280px] mx-auto rounded-[3rem] border-[8px] border-gray-900 dark:border-slate-800 bg-gray-900 dark:bg-slate-900 overflow-hidden shadow-2xl group"
            >
              {/* Phone Notch/Speaker */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 dark:bg-slate-800 rounded-b-2xl z-20" />
              
              <img 
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop" 
                alt="Branded School App"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = "https://placehold.co/400x800/0f172a/white?text=Premium+School+App";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 dark:from-slate-950 via-transparent to-transparent flex flex-col items-center justify-end p-8 text-center">
                <div className="mb-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Smartphone className="w-8 h-8 text-white dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-tight">App-kaaga Dugsiga</h3>
                <p className="text-indigo-200 dark:text-cyan-400 text-[10px] font-black uppercase tracking-widest">La Calaamadeeyay & La Daabacay</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>

    {/* FAQ Section */}
    <section className="py-32 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white text-center mb-16 uppercase tracking-tight">Common Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-indigo-100 dark:hover:border-white/10 transition-all shadow-sm group"
            >
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">{faq.q}</h4>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Final CTA Section */}
    <section className="py-32 px-4 text-center relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-tight">Diyaar ma u tahay in aad beddesho <br/> Dugsigaaga?</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
          Ku soo biir boqollaal dugsiyo ah oo hore u isticmaala Dugsimaamul si ay u automateeyaan hawlahooda
          oo ay ku faraxiyaan bulshada.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            to="/pricing"
            className="px-10 py-5 rounded-2xl bg-indigo-600 dark:bg-white text-white dark:text-slate-950 font-black hover:scale-105 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
          >
            See Plans & Pricing
          </Link>
          <Link
            to="/contact"
            className="px-10 py-5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
          >
            Talk to an Expert
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default LandingPage;

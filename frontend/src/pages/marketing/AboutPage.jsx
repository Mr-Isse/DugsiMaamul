import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Award, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const stats = [
    { label: 'Schools Trusted', value: '500+' },
    { label: 'Students Managed', value: '100k+' },
    { label: 'Years Experience', value: '10+' },
    { label: 'Support Rate', value: '99.9%' },
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We constantly evolve our platform to meet the changing needs of modern education.',
      icon: Target,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10'
    },
    {
      title: 'Reliability',
      description: 'Built on enterprise-grade infrastructure to ensure 100% uptime for your school.',
      icon: ShieldCheck,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10'
    },
    {
      title: 'Community',
      description: 'We believe in building strong relationships with schools, teachers, and parents.',
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      title: 'Excellence',
      description: 'Our goal is to provide the best-in-class management tools for educational success.',
      icon: Award,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
  ];

  return (
    <div className="bg-transparent min-h-screen text-gray-900 dark:text-white selection:bg-indigo-500/30 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        {/* Background Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-8"
          >
            <Sparkles className="w-4 h-4" /> The DugsiKabe Story
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tight text-gray-900 dark:text-white"
          >
            Empowering Education <br/>
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">Through Technology</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            DugsiKabe is a comprehensive School Management System designed to streamline academic, 
            administrative, and financial operations for schools of all sizes.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative border-y border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{stat.value}</p>
                <p className="text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
                Our Mission is to <br/>
                <span className="text-indigo-600 dark:text-cyan-400">Bridge the Gap</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
                <p>
                  At DugsiKabe, we aim to bridge the gap between traditional school management and modern 
                  digital needs. Our platform is designed to provide a unified experience for administrators, 
                  teachers, students, and parents.
                </p>
                <p>
                  We believe that by reducing administrative burden, educators can focus more on what 
                  matters most: teaching and student success.
                </p>
              </div>
              
              <div className="mt-12 flex flex-wrap gap-4">
                <Link to="/pricing" className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 group shadow-lg shadow-indigo-200 dark:shadow-none">
                  Explore Plans <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-600/20 blur-[100px] rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Our Mission" 
                className="rounded-[3rem] shadow-2xl relative z-10 border border-gray-100 dark:border-white/10"
              />
              <div className="absolute -bottom-8 -right-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 p-10 rounded-[2.5rem] shadow-2xl z-20 hidden lg:block backdrop-blur-xl">
                <p className="text-5xl font-black text-indigo-600 dark:text-cyan-400 mb-1">100%</p>
                <p className="text-xs font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Digital Ecosystem</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">Our Core Values</h2>
            <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              These principles guide everything we do and how we build the future of education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-10 rounded-[2.5rem] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-indigo-100 dark:hover:border-white/10 transition-all group shadow-sm"
              >
                <div className={`w-16 h-16 ${value.bg} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <value.icon className={`${value.color} w-8 h-8`} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{value.title}</h3>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, Sparkles, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 dark:border-white/5 last:border-0">
      <button
        className="w-full py-8 flex items-center justify-between text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-xl font-black transition-colors ${isOpen ? 'text-indigo-600 dark:text-cyan-400' : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400'}`}>
          {question}
        </span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-indigo-600/10 dark:bg-cyan-400/10 rotate-180' : 'bg-gray-100 dark:bg-white/5'}`}>
          <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-indigo-600 dark:text-cyan-400' : 'text-gray-400 dark:text-slate-500'}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-gray-500 dark:text-slate-400 leading-relaxed text-lg font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      category: 'General',
      items: [
        {
          question: 'What is DugsiKabe?',
          answer: 'DugsiKabe is a comprehensive enterprise school management system that helps educational institutions manage everything from student registration to financial reporting in one unified platform.'
        },
        {
          question: 'Is DugsiKabe cloud-based?',
          answer: 'Yes, DugsiKabe is a 100% cloud-based SaaS platform. You can access it from anywhere in the world with an internet connection.'
        },
        {
          question: 'Does it support multiple branches?',
          answer: 'Absolutely. DugsiKabe is built for multi-tenant and multi-branch operations, allowing school groups to manage all their locations from a single dashboard.'
        }
      ]
    },
    {
      category: 'Pricing & Plans',
      items: [
        {
          question: 'How much does DugsiKabe cost?',
          answer: 'We offer flexible pricing based on the number of students and features required. Please visit our Pricing page for detailed plans.'
        },
        {
          question: 'Do you offer a free trial?',
          answer: 'Yes, we offer a 14-day free trial for new schools to explore the platform and see how it fits their needs.'
        }
      ]
    },
    {
      category: 'Technical & Security',
      items: [
        {
          question: 'Is my data secure?',
          answer: 'Security is our top priority. We use industry-standard encryption, regular backups, and secure hosting to ensure your school data is always protected.'
        },
        {
          question: 'Can I export my data?',
          answer: 'Yes, you can export reports and data in multiple formats including CSV, Excel, and PDF.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="bg-transparent min-h-screen text-gray-900 dark:text-white selection:bg-indigo-500/30 overflow-hidden transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-8"
          >
            <Sparkles className="w-4 h-4" /> Support Knowledge Base
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tight text-gray-900 dark:text-white"
          >
            How can we <br/>
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">Help you?</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto relative group"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search for answers..."
              className="w-full h-16 pl-16 pr-8 bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 rounded-[2rem] text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-indigo-600/30 dark:focus:border-cyan-500/30 outline-none transition-all shadow-xl shadow-indigo-100/50 dark:shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-24">
              {filteredFaqs.map((category, idx) => (
                <div key={idx}>
                  <h2 className="text-xs font-black text-indigo-600 dark:text-cyan-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
                    {category.category}
                    <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                  </h2>
                  <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 shadow-sm">
                    {category.items.map((item, i) => (
                      <FAQItem key={i} {...item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-400 dark:text-slate-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No results found</h3>
              <p className="text-gray-500 dark:text-slate-400">Try searching for different keywords or categories.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[3rem] bg-slate-50 dark:bg-indigo-600 border border-slate-100 dark:border-none p-12 md:p-20 text-center relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 dark:bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8">Still have questions?</h2>
              <p className="text-slate-600 dark:text-indigo-100 text-xl max-w-2xl mx-auto mb-12 font-medium">
                Our team is here to help you with any technical or administrative inquiries you may have.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-10 py-5 bg-indigo-600 dark:bg-white text-white dark:text-indigo-600 font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-200 dark:shadow-none">
                <MessageCircle className="w-5 h-5" /> Contact Intelligence
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;

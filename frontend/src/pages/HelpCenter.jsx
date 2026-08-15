import React, { useState } from 'react';
import {
  Search,
  PlayCircle,
  FileText,
  MessageSquare,
  HelpCircle,
  GraduationCap,
  Users,
  CreditCard,
  Settings,
  ChevronRight,
  Sparkles,
  BookOpen,
  ChevronDown,
  ExternalLink,
  School,
  ClipboardList,
  UserPlus,
  DollarSign,
  Shield,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';

const HelpCard = ({ title, description, icon, links, searchTerm }) => {
  const matched = links.filter(l =>
    l.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (searchTerm && matched.length === 0 && !title.toLowerCase().includes(searchTerm.toLowerCase())) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 hover:shadow-xl transition-all group relative overflow-hidden bg-white rounded-[2rem] border border-slate-100"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform shadow-sm">
        {React.createElement(icon, { size: 32 })}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">{description}</p>
      <div className="space-y-4">
        {links.map((link, idx) => {
          if (searchTerm && !link.label.toLowerCase().includes(searchTerm.toLowerCase())) return null;
          return (
            <a
              key={idx}
              href={link.href}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-all group/link"
            >
              {link.label}
              <ChevronRight size={16} className="text-slate-300 group-hover/link:translate-x-1 transition-transform" />
            </a>
          );
        })}
      </div>
    </motion.div>
  );
};

const FaqItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-slate-100 last:border-b-0">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-6 text-left group"
    >
      <span className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors pr-4">{question}</span>
      <ChevronDown
        size={20}
        className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="pb-6 text-slate-500 leading-relaxed font-medium">{answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of setting up your school and managing branches.',
      icon: Sparkles,
      links: [
        { label: 'Initial Configuration Guide', href: '#getting-started-config' },
        { label: 'Managing Multiple Branches', href: '#branches-management' },
        { label: 'User Roles & Permissions', href: '#roles-permissions' },
      ]
    },
    {
      title: 'Academic Management',
      description: 'Master classes, subjects, schedules, and exams.',
      icon: GraduationCap,
      links: [
        { label: 'Setting up Classes & Subjects', href: '#classes-subjects' },
        { label: 'Managing Weekly Schedules', href: '#schedules' },
        { label: 'Exam & Result Processing', href: '#exams-results' },
      ]
    },
    {
      title: 'Student & Staff',
      description: 'How to handle enrollments, attendance, and staff management.',
      icon: Users,
      links: [
        { label: 'Bulk Student Import', href: '#student-import' },
        { label: 'Attendance Tracking Tips', href: '#attendance' },
        { label: 'Teacher Performance Logs', href: '#teacher-logs' },
      ]
    },
    {
      title: 'Finance & Billing',
      description: 'Manage fees, payments, and financial reports.',
      icon: CreditCard,
      links: [
        { label: 'Configuring Fee Structures', href: '#fee-structures' },
        { label: 'Payment Reconciliation', href: '#reconciliation' },
        { label: 'Generating Financial Reports', href: '#financial-reports' },
      ]
    },
    {
      title: 'System Settings',
      description: 'Advanced configuration and system maintenance.',
      icon: Settings,
      links: [
        { label: 'Backup & Data Security', href: '#backup-security' },
        { label: 'Audit Log Monitoring', href: '#audit-logs' },
        { label: 'Notification Channels', href: '#notifications' },
      ]
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides on platform features.',
      icon: PlayCircle,
      links: [
        { label: 'Platform Walkthrough', href: '#video-walkthrough' },
        { label: 'Mobile App Customization', href: '#video-mobile' },
        { label: 'Finance Module Deep Dive', href: '#video-finance' },
      ]
    }
  ];

  const faqs = [
    { question: 'How do I add a new student?', answer: 'Navigate to Students Management from the sidebar. Click "Add Student" and fill in the required fields: personal details, contact information, class assignment, and guardian info. You can also use the Bulk Import feature to add multiple students at once via CSV.' },
    { question: 'How do I create a class?', answer: 'Go to Classes Management under the Academic section. Click "Create Class", enter the class name (e.g., Grade 4A), select the teacher, assign subjects, and set the academic year. The system will auto-generate a class code for identification.' },
    { question: 'How do I set up fee structures?', answer: 'Visit Payments Management from the Finance section. Navigate to "Fee Structures" and click "Create New". Define fee types (tuition, transport, books), set amounts, choose applicable classes, and configure due dates. You can also set up installment plans.' },
    { question: 'How do I take attendance?', answer: 'Use the Attendance module from the sidebar. Select a class and date. The system shows all enrolled students with their photos. Mark each student as Present, Absent, Late, or Excused. Use bulk actions to mark all present at once, then adjust individually.' },
    { question: 'How do I generate reports?', answer: 'Check the Reports Center under Analytics. Choose from attendance summaries, grade sheets, financial reports, or custom reports. Select parameters like date range, class, and student, then click Generate. Reports can be exported as PDF or Excel. The Business Intelligence dashboard also offers visual analytics.' },
    { question: 'How do I manage branches?', answer: 'Use Branches Management in System Settings. Super admins can add new branches with unique subdomains. Configure branch-specific settings: currency, timezone, academic calendar, and fee structures. Data is isolated per branch for security but centralized for cross-branch reporting.' },
    { question: 'How do I set up the mobile app?', answer: 'Configure via School Settings under System. Go to "Mobile App Configuration" and upload your school logo, set the app theme colors, and enable features like GPS attendance tracking, push notifications, and parent portal access. The mobile app is available for both Android and iOS.' },
    { question: 'How do I backup my data?', answer: 'Use the Backup Manager under System Settings. You can create manual backups instantly or schedule automatic daily/weekly backups. Backups are encrypted and stored securely. The system keeps the last 30 backup snapshots. Restore any backup with a single click from the manager.' },
  ];

  const hasSearchResults = searchTerm
    ? categories.some(cat =>
        cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.links.some(l => l.label.toLowerCase().includes(searchTerm.toLowerCase()))
      ) || faqs.some(f => f.question.toLowerCase().includes(searchTerm.toLowerCase()))
    : true;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
            <HelpCircle className="w-4 h-4" /> DugsiKabe Knowledge Base
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-10 tracking-tight leading-[0.95]">
            How can we <br />
            <span className="text-indigo-600">help you</span> today?
          </h1>

          <div className="max-w-3xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search documentation, guides, and tutorials..."
              className="w-full h-20 pl-16 pr-8 bg-white border-none rounded-[2rem] text-xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-xl shadow-slate-200/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* No results */}
        {!hasSearchResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-bold text-slate-500">No results found for "{searchTerm}"</p>
            <p className="text-sm text-slate-400 mt-1">Try a different search term or browse the categories below.</p>
          </motion.div>
        )}

        {/* Categories Grid */}
        {hasSearchResults && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <HelpCard key={idx} {...cat} searchTerm={searchTerm} />
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium">Quick answers to common questions about the platform.</p>
          </div>
          <Card className="max-w-4xl mx-auto border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
            <CardContent className="p-0 divide-y divide-slate-100">
              {faqs.map((faq, idx) => (
                <FaqItem
                  key={idx}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaq === idx}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-24 bg-slate-900 rounded-[3.5rem] p-16 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Couldn't find what you need?</h2>
            <p className="text-slate-300 mb-12 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Our support engineers are available to help you with any complex technical requirements or custom workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/support"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl"
              >
                <MessageSquare size={24} /> Open Support Ticket
              </a>
              <a
                href="mailto:support@dugsihub.com"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-slate-800 text-white border border-slate-700 font-black rounded-2xl hover:bg-slate-700 transition-all shadow-lg"
              >
                <FileText size={24} /> Email Documentation
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HelpCenter;

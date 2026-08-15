import React from 'react';
import {
  UserPlus,
  GraduationCap,
  CreditCard,
  FileText,
  IdCard,
  Award,
  BookOpen,
  ClipboardCheck,
  Bell,
  Library,
  Calendar,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { hasFeatureAccess } from '../../utils/featureAccess';

const ACTIONS = [
  { label: 'Add Student', icon: UserPlus, path: '/students', feature: null },
  { label: 'Add Teacher', icon: GraduationCap, path: '/teachers', feature: null },
  { label: 'Collect Fee', icon: CreditCard, path: '/payments', feature: 'finance' },
  { label: 'Create Invoice', icon: FileText, path: '/payments', feature: 'finance' },
  { label: 'Generate ID Card', icon: IdCard, path: '/id-cards', feature: null },
  { label: 'Generate Certificate', icon: Award, path: '/certificates', feature: null },
  { label: 'Create Exam', icon: BookOpen, path: '/exams', feature: 'exams' },
  { label: 'Record Attendance', icon: ClipboardCheck, path: '/attendance', feature: null },
  { label: 'Send Notification', icon: Bell, path: '/notifications', feature: null },
  { label: 'Add Book', icon: Library, path: '/library', feature: 'library' },
  { label: 'Calendar', icon: Calendar, path: '/calendar', feature: null },
];

const QuickActions = ({ userInfo }) => {
  const navigate = useNavigate();

  const visibleActions = ACTIONS.filter(
    (a) => !a.feature || hasFeatureAccess(userInfo, a.feature)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="shadow-card hover:shadow-card-hover transition-all duration-200 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Quick Actions</CardTitle>
              <CardDescription className="text-xs mt-0.5">Frequent tasks at your fingertips</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {visibleActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-200 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                  aria-label={action.label}
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors duration-200 group-hover:scale-110 transition-transform duration-200">
                    <Icon size={20} className="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(QuickActions);

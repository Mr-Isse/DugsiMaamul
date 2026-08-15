import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Globe,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Building2,
  Loader2,
  Star,
  Plus,
  Command as CommandIcon,
  Languages,
  Shield,
  MessageCircle,
  Mail,
  Inbox,
  Calendar,
  FileText,
  CheckCheck,
  CheckCircle2,
  CircleDashed,
  Trash2,
  Check,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  adminApiSlice,
  useGetBranchesQuery,
  useGetAcademicYearsQuery,
  useLazyGlobalSearchQuery,
  useUpdatePreferencesMutation,
} from '../store/adminApiSlice';
import { setSelectedBranch } from '../store/branchSlice';
import { setSelectedYear, setAcademicYears } from '../store/academicSlice';
import { logout, setCredentials } from '../store/authSlice';
import { clearTenant } from '../store/tenantSlice';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './ui/command';

const RECENTS_KEY = 'dugsihub.globalSearch.recents';
const FAVORITES_KEY = 'dugsihub.globalSearch.favorites';

const scopedStorageKey = (prefix, { tenantId, userId, branchId }) =>
  [prefix, tenantId || 'no-tenant', userId || 'anonymous', branchId || 'all'].join(':');

const readStoredList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const branchIdOf = (branch) => (typeof branch === 'object' ? branch?._id : branch);

const entityLabels = [
  'Students',
  'Teachers',
  'Parents',
  'Branches',
  'Classes',
  'Subjects',
  'Attendance',
  'Exams',
  'Invoices',
  'Reports',
];

const quickActions = [
  { label: 'Add Student', path: '/students?action=create' },
  { label: 'Add Teacher', path: '/teachers?action=create' },
  { label: 'Add Parent', path: '/parents?action=create' },
  { label: 'Create Invoice', path: '/invoices?action=create' },
  { label: 'Create Payment', path: '/payments?action=create' },
  { label: 'Create Certificate', path: '/certificates?action=create' },
  { label: 'Create Notification', path: '/notification-center?action=create' },
  { label: 'Create Announcement', path: '/announcements?action=create' },
  { label: 'Add Asset', path: '/assets?action=create' },
  { label: 'Add Book', path: '/library?action=create' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'so', label: 'Somali' },
  { code: 'ar', label: 'Arabic' },
];

const statusClass = (status = '') => {
  const value = status.toLowerCase();
  if (['active', 'paid', 'approved', 'available', 'read', 'success'].includes(value)) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
  }
  if (['inactive', 'unpaid', 'pending', 'unread', 'under_review'].includes(value)) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
  }
  if (['suspended', 'rejected', 'failed', 'archived', 'damaged', 'lost'].includes(value)) {
    return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
  }
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
};

const sampleNotifications = [
  { id: 1, title: 'New Admission Received', desc: 'Ali Ahmed registered for Grade 10', time: '5 minutes ago', read: false, icon: Inbox, tone: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/15' },
  { id: 2, title: 'Payment Overdue', desc: 'Invoice #INV-2042 is overdue by 3 days', time: '32 minutes ago', read: false, icon: FileText, tone: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/15' },
  { id: 3, title: 'Parent Message', desc: 'New message from Farah Mohamoud', time: '1 hour ago', read: false, icon: MessageCircle, tone: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/15' },
  { id: 4, title: 'Exam Published', desc: 'Mid-Term Exam schedule is now available', time: '2 hours ago', read: true, icon: Calendar, tone: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/15' },
  { id: 5, title: 'Attendance Alert', desc: 'Grade 8-B has low attendance today', time: 'Yesterday', read: true, icon: Bell, tone: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/15' },
  { id: 6, title: 'Backup Completed', desc: 'Daily system backup completed successfully', time: 'Yesterday', read: true, icon: CheckCircle2, tone: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
];

const routeLabelMap = {
  '': 'Dashboard',
  'students': 'Students',
  'admissions': 'Admissions',
  'teachers': 'Teachers',
  'parents': 'Parents',
  'classes': 'Classes',
  'subjects': 'Subjects',
  'curriculum': 'Curriculum',
  'schedule': 'Schedule',
  'automatic-timetabling': 'Automatic Timetabling',
  'attendance': 'Attendance',
  'homework': 'Homework',
  'lesson-plans': 'Lesson Plans',
  'exams': 'Exams',
  'online-exams': 'Online Exams',
  'question-banks': 'Question Banks',
  'questions': 'Questions',
  'exam-results': 'Exam Results',
  'exam-halls': 'Exam Halls',
  'promotions': 'Promotions',
  'certificates': 'Certificates',
  'id-cards': 'ID Cards',
  'portfolios': 'Portfolios',
  'delivery-reports': 'Delivery Reports',
  'discipline': 'Discipline',
  'health-records': 'Health Records',
  'alumni': 'Alumni',
  'visitors': 'Visitors',
  'payments': 'Finance',
  'invoices': 'Invoices',
  'discounts': 'Discounts',
  'accounting': 'Accounting',
  'expenses': 'Expenses',
  'procurement': 'Procurement',
  'revenue-reports': 'Revenue Reports',
  'enterprise-finance': 'Enterprise Finance',
  'revenue-forecast': 'Revenue Forecast',
  'payroll': 'Payroll',
  'leave-management': 'Leave Management',
  'employee-loans': 'Employee Loans',
  'performance-reviews': 'Performance Reviews',
  'recruitment': 'Recruitment',
  'employee-contracts': 'Employee Contracts',
  'library': 'Library',
  'transport': 'Transport',
  'hostel': 'Hostel',
  'inventory': 'Inventory',
  'assets': 'Assets',
  'branches': 'Branches',
  'academic-years': 'Academic Years',
  'academic-terms': 'Academic Terms',
  'communication-messages': 'Communication',
  'announcements': 'Announcements',
  'notification-center': 'Notification Center',
  'notification-templates': 'Notification Templates',
  'events': 'Events',
  'reports': 'Reports',
  'business-intelligence': 'Analytics',
  'executive-dashboard': 'Executive Dashboard',
  'ai-learning-assistant': 'AI Learning',
  'ai-dashboard': 'AI Dashboard',
  'settings': 'Settings',
  'security-settings': 'Security',
  'plans': 'Plans',
  'roles': 'Roles',
  'permissions': 'Permissions',
  'documents': 'Documents',
  'activity': 'Activity',
  'audit': 'Audit Logs',
  'finance-audit': 'Finance Audit',
  'workflow': 'Workflow',
  'automation': 'Automation',
  'tasks': 'Tasks',
  'tickets': 'Tickets',
  'support': 'Support',
  'help': 'Help Center',
  'profile': 'Profile',
  'white-label': 'White Label',
  'dynamic-config': 'Dynamic Config',
  'cross-school-analytics': 'Cross-School Analytics',
  'regional-dashboard': 'Regional Dashboard',
  'enterprise-suite': 'Enterprise Suite',
  'advanced-security': 'Advanced Security',
  'risk-assessment': 'Risk Assessment',
  'performance-tracking': 'Performance Tracking',
};

const SearchResultRow = ({ result, isFavorite, onOpen, onToggleFavorite }) => (
  <CommandItem
    key={`${result.type}:${result.id}`}
    value={`${result.name || result.title || ''} ${result.typeLabel || result.type || ''} ${result.branch || ''} ${result.subtitle || ''}`}
    onSelect={() => onOpen(result)}
    className="flex items-center gap-3 px-2 py-2 data-[selected=true]:bg-slate-50 dark:data-[selected=true]:bg-slate-800 rounded-xl"
  >
    <Avatar className="h-10 w-10 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0">
      <AvatarImage src={result.avatar} alt={result.name} />
      <AvatarFallback className="rounded-xl text-[11px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
        {result.initials || result.typeLabel?.slice(0, 2)?.toUpperCase() || 'DH'}
      </AvatarFallback>
    </Avatar>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 min-w-0">
        <p className="truncate text-sm font-black text-slate-900 dark:text-white">{result.name || result.title}</p>
        {result.status && (
          <Badge variant="outline" className={`hidden sm:inline-flex shrink-0 rounded-full border-0 px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(result.status)}`}>
            {result.status}
          </Badge>
        )}
      </div>
      <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
        {result.typeLabel || result.type}
        {result.branch ? ` - ${result.branch}` : ''}
        {result.subtitle ? ` - ${result.subtitle}` : ''}
      </p>
    </div>
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggleFavorite(result);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          onToggleFavorite(result);
        }
      }}
      className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700"
      title={isFavorite ? 'Remove favorite' : 'Pin favorite'}
    >
      <Star size={16} className={isFavorite ? 'fill-indigo-600 text-indigo-600' : ''} />
    </button>
  </CommandItem>
);

const ModernHeader = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const { selectedBranch } = useSelector((state) => state.branch);
  const { selectedYear } = useSelector((state) => state.academic);
  const branchScope = userInfo?.branchScope || 'SPECIFIC';
  const userBranchId = userInfo?.branch?._id || userInfo?.branch;
  const currentBranchId = branchIdOf(selectedBranch);
  const tenantId = userInfo?.school?._id || userInfo?.school || userInfo?.tenantId;
  const userId = userInfo?._id || userInfo?.id;
  const recentsKey = scopedStorageKey(RECENTS_KEY, { tenantId, userId, branchId: currentBranchId });
  const favoritesKey = scopedStorageKey(FAVORITES_KEY, { tenantId, userId, branchId: currentBranchId });
  const [runGlobalSearch, { isFetching }] = useLazyGlobalSearchQuery();
  const [updatePreferences] = useUpdatePreferencesMutation();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('dugsi-theme')
      ? localStorage.getItem('dugsi-theme') === 'dark'
      : (localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : true)
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => readStoredList(recentsKey));
  const [favorites, setFavorites] = useState(() => readStoredList(favoritesKey));
  const searchInputRef = useRef(null);
  const cacheRef = useRef(new Map());
  const [notifications, setNotifications] = useState(sampleNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('dugsi-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('dugsi-theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('i18nextLng', i18n.language);
    localStorage.setItem('dugsihub.language', i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    const savedLanguage = userInfo?.preferences?.language;
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n, i18n.language, userInfo?.preferences?.language]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const isSchoolAdmin = ['schooladmin', 'school_admin', 'admin'].includes(userInfo?.role);

  const { data: branchesData } = useGetBranchesQuery(undefined, { skip: !isSchoolAdmin });
  const { data: yearsData } = useGetAcademicYearsQuery(undefined, { skip: !isSchoolAdmin });

  const allBranches = branchesData?.data || [];
  const availableBranches = branchScope === 'ALL_BRANCHES'
    ? allBranches
    : allBranches.filter((branch) => branch._id === userBranchId);
  const academicYears = useMemo(() => yearsData?.data || [], [yearsData?.data]);

  useEffect(() => {
    if (branchScope === 'SPECIFIC' && userBranchId && currentBranchId !== userBranchId) {
      dispatch(setSelectedBranch(userBranchId));
    }
  }, [branchScope, currentBranchId, dispatch, userBranchId]);

  useEffect(() => {
    if (academicYears.length > 0) {
      dispatch(setAcademicYears(academicYears));
    }
  }, [academicYears, dispatch]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    setRecentSearches(readStoredList(recentsKey));
    setFavorites(readStoredList(favoritesKey));
  }, [favoritesKey, recentsKey]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      return undefined;
    }
    const cacheKey = `${tenantId || 'tenant'}:${currentBranchId || 'all'}:${query.toLowerCase()}`;
    if (cacheRef.current.has(cacheKey)) {
      setResults(cacheRef.current.get(cacheKey));
      return undefined;
    }
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await runGlobalSearch({
          query,
          tenantId,
          branchId: currentBranchId || 'all',
        }).unwrap();
        const nextResults = response?.results || [];
        cacheRef.current.set(cacheKey, nextResults);
        setResults(nextResults);
      } catch (error) {
        console.error('Global search failed:', error);
        setResults([]);
      }
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [currentBranchId, runGlobalSearch, searchQuery, tenantId]);

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => `${item.type}:${item.id}`)), [favorites]);

  const saveRecents = useCallback((item) => {
    const next = [
      { ...item, searchedAt: Date.now() },
      ...recentSearches.filter((recent) => `${recent.type}:${recent.id}` !== `${item.type}:${item.id}`),
    ].slice(0, 10);
    setRecentSearches(next);
    localStorage.setItem(recentsKey, JSON.stringify(next));
  }, [recentSearches, recentsKey]);

  const toggleFavorite = (item) => {
    const key = `${item.type}:${item.id}`;
    const next = favoriteIds.has(key)
      ? favorites.filter((favorite) => `${favorite.type}:${favorite.id}` !== key)
      : [{ ...item, pinnedAt: Date.now() }, ...favorites].slice(0, 20);
    setFavorites(next);
    localStorage.setItem(favoritesKey, JSON.stringify(next));
  };

  const openSearchItem = (item) => {
    saveRecents(item);
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(item.link || '/');
  };

  const handleQuickAction = (action) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(action.path);
  };

  const handleBranchChange = (branchId) => {
    dispatch(setSelectedBranch(branchId));
    cacheRef.current.clear();
    dispatch(adminApiSlice.util.invalidateTags([
      'User', 'Student', 'Teacher', 'Parent', 'Class', 'Subject', 'Attendance', 'Exam',
      'Payment', 'PaymentMonth', 'Report', 'Dashboard', 'Schedule', 'Announcement',
      'Event', 'ExamHall', 'AcademicYear', 'Notification', 'Document', 'Admission',
      'Asset', 'Discount', 'LibraryBook', 'TransportRoute', 'TransportVehicle',
      'Certificate', 'Hostel',
    ]));
  };

  const handleLanguageChange = async (languageCode) => {
    i18n.changeLanguage(languageCode);
    try {
      const response = await updatePreferences({ language: languageCode }).unwrap();
      dispatch(setCredentials({
        ...userInfo,
        preferences: {
          ...(userInfo?.preferences || {}),
          ...(response?.preferences || {}),
        },
      }));
    } catch (error) {
      console.error('Language preference persistence failed:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearTenant());
    navigate('/login');
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  const activeBranchName = availableBranches.find((branch) => branch._id === currentBranchId)?.name || 'Main Branch';
  const activeYearName = academicYears.find((year) => year._id === branchIdOf(selectedYear))?.yearName
    || academicYears.find((year) => year._id === selectedYear?._id)?.name
    || selectedYear?.name
    || 'Select Year';
  const activeLanguage = languages.find((language) => language.code === i18n.language)?.label || 'Language';
  const visibleResults = searchQuery.trim().length >= 2 ? results : [];
  const tenantSchoolName = userInfo?.school?.name || 'DugsiKabe';

  const breadcrumbSegments = useMemo(() => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return [];
    return parts
      .map((part) => {
        const label = routeLabelMap[part] || part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return { slug: part, label };
      })
      .filter((seg) => seg.label && seg.slug);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
        <div className="flex h-[72px] items-center gap-3 px-4 sm:px-5 lg:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="hidden xl:flex min-w-0 items-center gap-3 pl-1">
              <Separator orientation="vertical" className="h-6 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
              <Breadcrumb>
                <BreadcrumbList className="gap-1.5">
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate('/')} className="text-[13px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer flex items-center gap-1.5">
                      <Shield size={13} className="text-indigo-500" />
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbSegments.length > 0 && <BreadcrumbSeparator />}
                  {breadcrumbSegments.map((seg, idx) => {
                    const isLast = idx === breadcrumbSegments.length - 1;
                    if (isLast) {
                      return (
                        <BreadcrumbItem key={seg.slug}>
                          <BreadcrumbPage className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[220px]">
                            {seg.label}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      );
                    }
                    return (
                      <React.Fragment key={seg.slug}>
                        <BreadcrumbItem>
                          <BreadcrumbLink onClick={() => navigate(`/${seg.slug}`)} className="text-[13px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer capitalize truncate max-w-[140px]">
                            {seg.label}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
              <Separator orientation="vertical" className="h-6 w-px bg-slate-200 dark:bg-slate-800 shrink-0 hidden 2xl:block" />
            </div>

            <div className="min-w-0 flex-1 max-w-2xl hidden md:block xl:ml-auto">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="group h-11 w-full flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 text-left text-[14px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <Search className="h-[18px] w-[18px] shrink-0 text-slate-400" />
                <span className="truncate">Search students, teachers, classes...</span>
                <span className="ml-auto hidden md:inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-bold text-slate-400 bg-white/60 dark:bg-slate-800/40">
                  <CommandIcon size={12} /> K
                </span>
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-1">
            <Button variant="ghost" size="icon" className="rounded-full md:hidden" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5 text-slate-500" />
            </Button>

            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={toggleDarkMode} aria-label="Toggle theme">
              {darkMode ? <Sun className="h-[18px] w-[18px] text-amber-500" /> : <Moon className="h-[18px] w-[18px] text-slate-500" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex h-10 gap-2 rounded-xl font-bold text-[13px]">
                  <Globe className="h-[17px] w-[17px] text-slate-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{activeLanguage.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-slate-400 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                <DropdownMenuLabel className="flex items-center gap-2 text-[12px]">
                  <Languages size={15} />
                  Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`font-bold text-[13px] ${i18n.language === language.code ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
                  >
                    {language.label}
                    {i18n.language === language.code && <DropdownMenuShortcut><Check size={14} /></DropdownMenuShortcut>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative" aria-label="Notifications">
                  <Bell className="h-[18px] w-[18px] text-slate-600 dark:text-slate-400" />
                  {unreadCount > 0 && (
                    <Badge className="absolute top-1.5 right-1.5 -translate-y-0.5 translate-x-0.5 h-[18px] min-w-[18px] rounded-full border-0 px-1.5 text-[10px] font-black shadow-none bg-red-500 dark:bg-red-500 text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[380px] rounded-2xl p-0 overflow-hidden">
                <DropdownMenuLabel className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-slate-500" />
                      <span className="text-[13px] font-black text-slate-900 dark:text-slate-100">Notifications</span>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="rounded-full text-[10px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-0">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={markAllRead} title="Mark all as read">
                        <CheckCheck size={14} className="text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={clearAll} title="Clear all">
                        <Trash2 size={14} className="text-slate-500" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <ScrollArea className="max-h-[380px]">
                  {notifications.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <Inbox size={22} />
                      </div>
                      <p className="text-[13px] font-bold text-slate-600 dark:text-slate-400">No notifications yet</p>
                    </div>
                  )}
                  <DropdownMenuGroup className="p-1.5">
                    {notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <DropdownMenuItem key={n.id} className="group flex items-start gap-3 rounded-xl p-3 data-[selected=true]:bg-slate-50 dark:data-[selected=true]:bg-slate-800/70">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${n.bg}`}>
                            <Icon size={17} className={n.tone} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                              <p className={`text-[13px] font-extrabold leading-snug ${n.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                {n.title}
                              </p>
                              {!n.read && <CircleDashed size={9} className="mt-1.5 shrink-0 fill-indigo-500 text-indigo-500" />}
                            </div>
                            <p className="mt-0.5 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 leading-snug">
                              {n.desc}
                            </p>
                            <p className="mt-1 text-[10.5px] font-bold text-slate-400 dark:text-slate-500">{n.time}</p>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </ScrollArea>
                <DropdownMenuSeparator />
                <div className="px-2 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-9 rounded-xl font-bold text-[12px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={() => navigate('/notification-center')}
                  >
                    View all notifications
                    <DropdownMenuShortcut className="text-[10px] font-black opacity-70">⇧N</DropdownMenuShortcut>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative" aria-label="Messages">
                  <Mail className="h-[18px] w-[18px] text-slate-600 dark:text-slate-400" />
                  <Badge className="absolute top-1.5 right-1.5 -translate-y-0.5 translate-x-0.5 h-[18px] min-w-[18px] rounded-full border-0 px-1.5 text-[10px] font-black shadow-none bg-emerald-500 text-white">
                    5
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 overflow-hidden">
                <DropdownMenuLabel className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-slate-500" />
                    <span className="text-[13px] font-black text-slate-900 dark:text-slate-100">Messages</span>
                  </div>
                </DropdownMenuLabel>
                <ScrollArea className="max-h-[340px]">
                  <DropdownMenuGroup className="p-1.5">
                    {[
                      { name: 'Farah Mohamoud', msg: 'Hi, thank you for the update...', time: '10m', avatar: 'FM', tone: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300', unread: true },
                      { name: 'Parent Committee', msg: 'Meeting scheduled for tomorrow.', time: '1h', avatar: 'PC', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300', unread: true },
                      { name: 'Teacher Sarah', msg: 'Grade reports ready for review.', time: '3h', avatar: 'TS', tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300', unread: false },
                    ].map((m, idx) => (
                      <DropdownMenuItem key={idx} className="group flex items-center gap-3 rounded-xl p-3 data-[selected=true]:bg-slate-50 dark:data-[selected=true]:bg-slate-800/70">
                        <Avatar className="h-10 w-10 rounded-2xl shrink-0 ring-2 ring-white dark:ring-slate-900">
                          <AvatarFallback className={`rounded-2xl text-[11px] font-black ${m.tone}`}>{m.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[13px] font-extrabold text-slate-900 dark:text-slate-100">{m.name}</p>
                            {m.unread && <CircleDashed size={9} className="shrink-0 fill-emerald-500 text-emerald-500" />}
                          </div>
                          <p className="mt-0.5 truncate text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">{m.msg}</p>
                          <p className="mt-1 text-[10.5px] font-bold text-slate-400 dark:text-slate-500">{m.time} ago</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </ScrollArea>
                <DropdownMenuSeparator />
                <div className="px-2 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-9 rounded-xl font-bold text-[12px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={() => navigate('/communication-messages')}
                  >
                    Open inbox
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-7 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

            {isSchoolAdmin && availableBranches.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 gap-2 px-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80">
                    <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="hidden min-w-0 text-left leading-tight">
                      <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 truncate">
                        {activeBranchName}
                      </p>
                      <p className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {tenantSchoolName}
                      </p>
                    </div>
                    <ChevronDown size={15} className="text-slate-400 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-1.5">
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Switch Branch</p>
                  </div>
                  <DropdownMenuItem
                    className="rounded-xl font-bold text-[13px] py-2.5"
                    onClick={() => handleBranchChange(null)}
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-2 shrink-0">
                      <Building2 size={14} />
                    </div>
                    Main Branch
                  </DropdownMenuItem>
                  {availableBranches.map((branch) => (
                    <DropdownMenuItem
                      key={branch._id}
                      onClick={() => handleBranchChange(branch._id)}
                      className="rounded-xl font-bold text-[13px] py-2.5"
                    >
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-2 shrink-0">
                        <Building2 size={14} />
                      </div>
                      {branch.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 px-2 rounded-2xl shrink-0">
                  <Avatar className="h-9 w-9 shrink-0 ring-2 ring-slate-100 dark:ring-slate-800 rounded-2xl">
                    <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                    <AvatarFallback className="rounded-2xl text-[11px] font-black bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
                      {userInfo?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl p-2" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex items-center gap-3 py-1">
                    <Avatar className="h-11 w-11 rounded-2xl ring-2 ring-slate-100 dark:ring-slate-800">
                      <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                      <AvatarFallback className="rounded-2xl text-[12px] font-black bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                        {userInfo?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[14px] font-black leading-tight text-slate-900 dark:text-slate-50 truncate">{userInfo?.name}</p>
                      <p className="text-[11.5px] font-semibold leading-tight text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {userInfo?.email}
                      </p>
                      <Badge variant="outline" className="mt-1.5 w-fit rounded-full border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 px-2 py-0.5 capitalize">
                        {userInfo?.role?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="rounded-xl font-bold text-[13px] py-2.5 gap-2" onClick={() => { setOpenMobile?.(false); navigate('/profile'); }}>
                    <User size={15} />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl font-bold text-[13px] py-2.5 gap-2" onClick={() => { setOpenMobile?.(false); navigate('/settings'); }}>
                    <Settings size={15} />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="rounded-xl font-bold text-[13px] py-2.5 gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  Sign out
                  <DropdownMenuShortcut className="text-[10px] font-black opacity-70">⇧Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Global Search: Command + Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={(open) => { setIsSearchOpen(open); if (!open) setSearchQuery(''); }}>
        <DialogContent className="p-0 max-w-3xl w-[calc(100%-1.5rem)] sm:w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden bg-transparent">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <DialogDescription className="sr-only">Search students, teachers, classes, exams, invoices and more</DialogDescription>
          <Command
            className="rounded-2xl border-0 bg-white dark:bg-slate-950"
            loop
            onKeyDown={(event) => {
              if (event.key === 'Escape' && !searchQuery) {
                setIsSearchOpen(false);
              }
            }}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-3 py-2">
              <Search className="h-5 w-5 text-slate-400 shrink-0 ml-1" />
              <CommandInput
                ref={searchInputRef}
                value={searchQuery}
                onValueChange={setSearchQuery}
                placeholder="Search anything in DugsiHub..."
                className="h-12 min-w-0 flex-1 bg-transparent text-body-base font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50 border-0 focus:ring-0 shadow-none pl-0"
              />
              {isFetching && <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0 mr-1" />}
              <CommandShortcut className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-bold text-slate-400 bg-white/60 dark:bg-slate-800/40">
                ESC
              </CommandShortcut>
            </div>
            <CommandList className="max-h-[64vh] p-2">
              {searchQuery.trim().length >= 2 && !isFetching && visibleResults.length === 0 && (
                <CommandEmpty className="py-10 text-center rounded-xl">
                  <p className="text-body-base font-semibold text-slate-600 dark:text-slate-300">No matching records found.</p>
                  <p className="mt-1 text-body-sm text-slate-400">Try a name, ID, phone, invoice, book, report, or branch.</p>
                </CommandEmpty>
              )}
              {visibleResults.length > 0 && (
                <CommandGroup heading="Results" className="p-1">
                  {visibleResults.map((result) => (
                    <SearchResultRow
                      key={`result:${result.type}:${result.id}`}
                      result={result}
                      isFavorite={favoriteIds.has(`${result.type}:${result.id}`)}
                      onOpen={openSearchItem}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </CommandGroup>
              )}
              {searchQuery.trim().length < 2 && (
                <>
                  {favorites.length > 0 && (
                    <CommandGroup heading="Favorites" className="p-1">
                      {favorites.slice(0, 8).map((favorite) => (
                        <SearchResultRow
                          key={`favorite:${favorite.type}:${favorite.id}`}
                          result={favorite}
                          isFavorite
                          onOpen={openSearchItem}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </CommandGroup>
                  )}
                  {recentSearches.length > 0 && (
                    <>
                      {favorites.length > 0 && <CommandSeparator />}
                      <CommandGroup heading="Recent Searches" className="p-1">
                        {recentSearches.slice(0, 10).map((recent) => (
                          <SearchResultRow
                            key={`recent:${recent.type}:${recent.id}`}
                            result={recent}
                            isFavorite={favoriteIds.has(`${recent.type}:${recent.id}`)}
                            onOpen={openSearchItem}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </CommandGroup>
                    </>
                  )}
                  <CommandSeparator />
                  <CommandGroup heading="Quick Actions" className="p-1">
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {quickActions.map((action) => (
                        <CommandItem
                          key={action.label}
                          value={action.label}
                          onSelect={() => handleQuickAction(action)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 data-[selected=true]:bg-slate-50 dark:data-[selected=true]:bg-slate-800"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                            <Plus size={15} />
                          </span>
                          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{action.label}</span>
                        </CommandItem>
                      ))}
                    </div>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Searchable Areas" className="p-1">
                    <div className="flex flex-wrap gap-2 px-2 py-2">
                      {entityLabels.map((label) => (
                        <Badge key={label} variant="secondary" className="rounded-full border-0 px-3 py-1.5 text-[12px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 shadow-none">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModernHeader;

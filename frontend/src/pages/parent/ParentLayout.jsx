import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Users, LayoutDashboard, User, CalendarCheck, GraduationCap, CreditCard, Clock, Megaphone, LogOut, Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
  { label: 'My Children', path: '/parent', icon: Users, exact: true },
  { label: 'Announcements', path: '/parent/announcements', icon: Megaphone },
];

const childNavItems = [
  { label: 'Profile', suffix: 'profile', icon: User },
  { label: 'Attendance', suffix: 'attendance', icon: CalendarCheck },
  { label: 'Results', suffix: 'results', icon: GraduationCap },
  { label: 'Fees', suffix: 'fees', icon: CreditCard },
  { label: 'Timetable', suffix: 'timetable', icon: Clock },
];

const ParentLayout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedChild, setExpandedChild] = useState(null);

  if (!userInfo || userInfo.role !== 'parent') {
    return <Navigate to="/parent/login" replace />;
  }

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);
  const childMatch = location.pathname.match(/^\/parent\/child\/([^/]+)/);
  const activeChildId = childMatch?.[1];

  const handleLogout = () => {
    dispatch(logout());
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Parent Portal</h2>
            <p className="text-slate-500 text-xs truncate max-w-[140px]">{userInfo.name}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {userInfo.linkedStudents?.length > 0 && (
          <div className="pt-4">
            <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Children</p>
            {userInfo.linkedStudents.map((child) => {
              const childId = typeof child === 'object' ? child._id : child;
              const childName = typeof child === 'object' ? child.name : `Child ${childId.slice(-4)}`;
              const isExpanded = activeChildId === childId;
              return (
                <div key={childId}>
                  <Link
                    to={`/parent/child/${childId}`}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isExpanded
                        ? 'bg-white/10 text-white border border-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
                      {childName.charAt(0)}
                    </div>
                    <span className="truncate flex-1">{childName}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Link>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-emerald-500/20 pl-3">
                      {childNavItems.map((ci) => {
                        const CIcon = ci.icon;
                        const path = `/parent/child/${childId}/${ci.suffix}`;
                        const ciActive = location.pathname === path;
                        return (
                          <Link
                            key={ci.suffix}
                            to={path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                              ciActive
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <CIcon className="w-3 h-3" />
                            {ci.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900/50 border-r border-white/5 flex-col fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900 border-r border-white/5 z-10">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">Parent Portal</span>
          </div>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;

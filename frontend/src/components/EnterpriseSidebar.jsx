import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  LogOut,
  MoreHorizontal,
  Shield,
  CalendarDays,
  Menu,
  X,
} from 'lucide-react';
import { logout } from '../store/authSlice';
import { clearTenant } from '../store/tenantSlice';
import { hasPermission } from '../utils/permissions';
import { hasFeatureAccess } from '../utils/featureAccess';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import {
  SCHOOL_NAVIGATION,
  SUPER_ADMIN_NAVIGATION,
  SUPER_ADMIN_BRANDING,
} from '../config/navigation';

const EnterpriseSidebar = ({ variant = 'school' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { selectedYear } = useSelector((state) => state.academic);
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const navigation = useMemo(() => {
    if (variant === 'superadmin') {
      return SUPER_ADMIN_NAVIGATION;
    }
    return SCHOOL_NAVIGATION;
  }, [variant]);

  const schoolName = useMemo(() => {
    if (variant === 'superadmin') return SUPER_ADMIN_BRANDING.name;
    return userInfo?.school?.name || 'DugsiKabe';
  }, [variant, userInfo?.school?.name]);

  const schoolLogo = variant === 'superadmin'
    ? null
    : userInfo?.school?.logo?.url || userInfo?.school?.logo || null;

  const activeYearName = useMemo(() => {
    if (variant === 'superadmin') return null;
    return (
      (typeof selectedYear === 'object' ? selectedYear?.yearName || selectedYear?.name : null) ||
      userInfo?.academicYear?.name ||
      userInfo?.academicYear?.yearName ||
      '2024/2025'
    );
  }, [selectedYear, userInfo?.academicYear, variant]);

  const isVisible = (item) => {
    if (item.feature && !hasFeatureAccess(userInfo, item.feature)) return false;
    if (item.permission && !hasPermission(userInfo, item.permission)) return false;
    return true;
  };

  const isItemActive = (item) => {
    if (item.href === (variant === 'superadmin' ? '/admin' : '/')) {
      return location.pathname === item.href;
    }
    return location.pathname.startsWith(item.href);
  };

  const hasActiveChild = (items) =>
    items.some((item) => isItemActive(item));

  const toggleGroup = (groupTitle) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupTitle)) {
        next.delete(groupTitle);
      } else {
        next.add(groupTitle);
      }
      return next;
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearTenant());
    navigate(variant === 'superadmin' ? '/admin/login' : '/login');
    setIsMobileOpen(false);
  };

  const closeMobile = () => setIsMobileOpen(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800/50">
        <div
          className={
            variant === 'superadmin'
              ? `flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-lg ${SUPER_ADMIN_BRANDING.iconGradient}`
              : 'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'
          }
        >
          {variant === 'superadmin' ? (
            <SUPER_ADMIN_BRANDING.icon size={24} strokeWidth={2.2} />
          ) : schoolLogo ? (
            <img src={schoolLogo} alt={schoolName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
              <Shield size={24} strokeWidth={2.1} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
            {variant === 'superadmin' ? (
              <>
                DugsiKabe{' '}
                <span className={SUPER_ADMIN_BRANDING.accent}>Admin</span>
              </>
            ) : (
              schoolName
            )}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
            {variant === 'superadmin' ? SUPER_ADMIN_BRANDING.subtitle : 'School Management System'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        {navigation.map((group, groupIdx) => {
          const visibleItems = group.items.filter(isVisible);
          if (!visibleItems.length) return null;

          const isGroupActive = hasActiveChild(visibleItems);
          const isExpanded = expandedGroups.has(group.title) || isGroupActive;

          if (!group.title) {
            return (
              <div key={groupIdx} className="space-y-1 pb-2">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                        }`
                      }
                    >
                      <Icon size={18} strokeWidth={2} className="shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={groupIdx} className="space-y-1 pb-3">
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <span>{group.title}</span>
                {isExpanded ? (
                  <ChevronDown size={14} className="shrink-0 transition-transform" />
                ) : (
                  <ChevronRight size={14} className="shrink-0 transition-transform" />
                )}
              </button>
              {isExpanded && (
                <div className="space-y-1 pl-2">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={closeMobile}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                          }`
                        }
                      >
                        <Icon size={18} strokeWidth={2} className="shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </ScrollArea>
      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800/50 px-4 py-4">
        {variant === 'superadmin' ? (
          <>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 blur-[4px] opacity-50 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-black text-slate-700 dark:text-slate-200 leading-tight">
                    All systems OK
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-tight">
                    System operational
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="shrink-0 rounded-full border-0 text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              >
                ONLINE
              </Badge>
            </div>

            <Button
              variant="ghost"
              className="mt-3 w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl font-bold px-3 py-2.5 h-auto"
              onClick={handleLogout}
            >
              <LogOut size={17} strokeWidth={2} />
              <span className="text-[13px] leading-none">Logout</span>
            </Button>
          </>
        ) : (
          <>
            <div className="mb-3">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Current Session
              </p>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <CalendarDays size={15} className="shrink-0 text-slate-500 dark:text-slate-400" />
                <span className="truncate text-[13px] font-bold text-slate-700 dark:text-slate-200">
                  {activeYearName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-1">
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-slate-100 dark:ring-slate-800">
                <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                <AvatarFallback className="text-[11px] font-black bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  {userInfo?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {userInfo?.name}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400 dark:text-slate-500 capitalize leading-tight">
                  {userInfo?.role?.replace(/_/g, ' ')}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <MoreHorizontal size={15} className="text-current" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                  <DropdownMenuItem
                    className="rounded-lg font-semibold text-[13px] py-2"
                    onClick={() => {
                      closeMobile();
                      navigate('/settings');
                    }}
                  >
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    className="rounded-lg font-semibold text-[13px] py-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen flex-col shrink-0 z-10 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-slate-950">
          <SheetHeader className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/50">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={18} />
            </Button>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={20} />
      </Button>
    </>
  );
};

export default EnterpriseSidebar;

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon, Bell, Search, UserCog, Globe, Shield, Settings, LogOut, User } from 'lucide-react';
import EnterpriseSidebar from '../components/EnterpriseSidebar';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from '../components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { logout } from '../store/authSlice';
import { clearTenant } from '../store/tenantSlice';
import { useLocation } from 'react-router-dom';

const routeLabelMapSA = {
  admin: 'Platform',
  schools: 'Schools',
  features: 'Features',
  admins: 'Admins',
  subscriptions: 'Subscriptions',
  plans: 'Plans',
  leads: 'Leads',
  tickets: 'Support',
  errors: 'Monitoring',
  system: 'System Settings',
};

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('dugsi-theme')
      ? localStorage.getItem('dugsi-theme') === 'dark'
      : (localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : true)
  );

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

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearTenant());
    navigate('/admin/login');
  };

  const breadcrumbSegments = React.useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts
      .map((part) => ({ slug: part, label: routeLabelMapSA[part] || part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }))
      .filter((seg) => seg.slug && seg.label);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen">
      <EnterpriseSidebar variant="superadmin" />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-3 px-4 sm:px-5 lg:px-6">
            <div className="flex items-center gap-3 min-w-0 flex-1">

              <div className="hidden xl:flex min-w-0 items-center gap-3 pl-1">
                <Separator orientation="vertical" className="h-6 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
                <Breadcrumb>
                  <BreadcrumbList className="gap-1.5">
                    <BreadcrumbItem>
                      <BreadcrumbLink onClick={() => navigate('/admin')} className="text-[13px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer flex items-center gap-1.5">
                        <Shield size={13} className="text-indigo-500" />
                        Platform
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbSegments.slice(1).length > 0 && <BreadcrumbSeparator />}
                    {breadcrumbSegments.slice(1).map((seg, idx, arr) => {
                      const isLast = idx === arr.length - 1;
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

              <div className="min-w-0 flex-1 max-w-xl hidden md:block xl:ml-auto">
                <button
                  type="button"
                  className="group h-11 w-full flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 text-left text-[14px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-not-allowed opacity-80"
                >
                  <Search className="h-[18px] w-[18px] shrink-0 text-slate-400" />
                  <span className="truncate">Search platform...</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center ml-2">
                <Badge variant="outline" className="rounded-full border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] px-3 py-1">
                  Admin
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-1">
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <Search className="h-5 w-5 text-slate-500" />
              </Button>

              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={toggleDarkMode} aria-label="Toggle theme">
                {darkMode ? <Sun className="h-[18px] w-[18px] text-amber-500" /> : <Moon className="h-[18px] w-[18px] text-slate-500" />}
              </Button>

              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative" aria-label="Notifications">
                <Bell className="h-[18px] w-[18px] text-slate-600 dark:text-slate-400" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-950" />
              </Button>

              <div className="w-px h-7 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 gap-2 px-2 rounded-2xl shrink-0">
                    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-slate-100 dark:ring-slate-800 rounded-2xl">
                      <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                      <AvatarFallback className="rounded-2xl text-[11px] font-black bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
                        {userInfo?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || <UserCog size={16} />}
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
                          {userInfo?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'SA'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[14px] font-black leading-tight text-slate-900 dark:text-slate-50 truncate">{userInfo?.name || 'Super Admin'}</p>
                        <p className="text-[11.5px] font-semibold leading-tight text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {userInfo?.email || 'System Owner'}
                        </p>
                        <Badge variant="outline" className="mt-1.5 w-fit rounded-full border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 px-2 py-0.5">
                          Super Admin
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="rounded-xl font-bold text-[13px] py-2.5 gap-2" onClick={() => navigate('/admin/system')}>
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

        <main className="flex-1 p-4 sm:p-6 md:p-8 animate-in fade-in duration-500">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;

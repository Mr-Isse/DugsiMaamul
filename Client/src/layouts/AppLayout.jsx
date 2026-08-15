import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Menu, ChevronDown, ChevronRight, LogOut, MoreHorizontal, Shield, CalendarDays, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useUi } from '@/hooks/useUi'
import { appConfig } from '@/config/app.config'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { logout } from '@/store/slices/authSlice'
import { clearTenant } from '@/store/slices/tenantSlice'
import { selectAuthHydrated } from '@/store/slices/authSlice'
import { SCHOOL_NAVIGATION, SUPER_ADMIN_NAVIGATION, SUPER_ADMIN_BRANDING } from '@/config/navigation'
import { hasPermission } from '@/utils/permissions'
import { hasFeatureAccess } from '@/utils/featureAccess'
import { useState, useMemo, useEffect } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Skeleton } from '@/components/ui/skeleton'


/**
 * Main application layout with sidebar navigation
 */
export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const {
    sidebarOpen,
    mobileNavOpen,
    openMobileNav,
    closeMobileNav,
    pageTitle,
  } = useUi()
  const { user } = useSelector((state) => state.auth)
  const authHydrated = useSelector(selectAuthHydrated)
  const { selectedYear } = useSelector((state) => state.academic)
  const [expandedGroups, setExpandedGroups] = useState(new Set())

  // Determine if this is Super Admin or School Admin
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'super_admin'
  const navigation = useMemo(() => {
    return isSuperAdmin ? SUPER_ADMIN_NAVIGATION : SCHOOL_NAVIGATION
  }, [isSuperAdmin])

  const schoolName = useMemo(() => {
    if (isSuperAdmin) return SUPER_ADMIN_BRANDING.name
    return user?.school?.name || appConfig.appName
  }, [isSuperAdmin, user?.school?.name])

  const schoolLogo = useMemo(() => {
    if (isSuperAdmin) return null
    return user?.school?.logo?.url || user?.school?.logo || null
  }, [isSuperAdmin, user?.school?.logo])

  const enabledFeatures = useMemo(() => {
    if (isSuperAdmin) return ['ALL_MODULES']
    return user?.school?.enabledFeatures || user?.enabledFeatures || []
  }, [isSuperAdmin, user?.school?.enabledFeatures, user?.enabledFeatures])

  const activeYearName = useMemo(() => {
    if (isSuperAdmin) return null
    return (
      (typeof selectedYear === 'object' ? selectedYear?.yearName || selectedYear?.name : null) ||
      user?.academicYear?.name ||
      user?.academicYear?.yearName ||
      '2024/2025'
    )
  }, [selectedYear, user?.academicYear, isSuperAdmin])

  // Auto-expand groups based on active route
  useEffect(() => {
    if (!authHydrated) return
    
    const groupsToExpand = new Set()
    navigation.forEach(group => {
      if (group.title && group.items.some(item => location.pathname.startsWith(item.href))) {
        groupsToExpand.add(group.title)
      }
    })
    setExpandedGroups(groupsToExpand)
  }, [location.pathname, authHydrated, navigation])

  // Wait for auth hydration before rendering sidebar
  if (!authHydrated) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="flex min-h-dvh">
          {/* Desktop Sidebar Skeleton */}
          <aside className="hidden lg:flex w-72 h-screen flex-col shrink-0 border-r border-border">
            <div className="flex h-16 items-center gap-2 px-6 border-b">
              <Skeleton className="h-8 w-8 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex-1 px-4 py-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
            <div className="p-4 border-t space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>
          {/* Main Content Skeleton */}
          <main className="flex-1 overflow-auto">
            <DashboardHeader />
            <div className="p-6">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  const isVisible = (item) => {
    // Check feature access first
    if (item.feature && !hasFeatureAccess(user, item.feature)) return false
    // Check permission if required
    if (item.permission && !hasPermission(user, item.permission)) return false
    return true
  }

  const isItemActive = (item) => {
    if (item.href === (isSuperAdmin ? '/admin/dashboard' : '/dashboard')) {
      return location.pathname === item.href
    }
    return location.pathname.startsWith(item.href)
  }

  const hasActiveChild = (items) =>
    items.some((item) => isItemActive(item))

  const toggleGroup = (groupTitle) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupTitle)) {
        next.delete(groupTitle)
      } else {
        next.add(groupTitle)
      }
      return next
    })
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearTenant())
    navigate(isSuperAdmin ? '/super-admin/login' : '/login')
    closeMobileNav()
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="flex min-h-dvh">
        {/* Desktop Sidebar */}
        <aside
          className="hidden lg:flex w-72 h-screen flex-col shrink-0 z-10 bg-background border-r border-border"
          aria-label="Primary"
        >
          <div className="flex h-16 items-center gap-2 px-6 border-b">
            <div
              className={cn(
                'size-8 rounded-md flex items-center justify-center',
                isSuperAdmin
                  ? `${SUPER_ADMIN_BRANDING.iconGradient} text-white`
                  : 'bg-brand-navy'
              )}
              aria-hidden
            >
              {isSuperAdmin ? (
                <SUPER_ADMIN_BRANDING.icon size={18} strokeWidth={2.2} />
              ) : schoolLogo ? (
                <img src={schoolLogo} alt={schoolName} className="h-full w-full object-cover rounded-md" />
              ) : (
                <Shield size={18} strokeWidth={2.1} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                {schoolName}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSuperAdmin ? SUPER_ADMIN_BRANDING.subtitle : 'School ERP'}
              </p>
            </div>
          </div>
          <ScrollArea className="flex-1 px-4 py-6">
            {navigation.map((group, groupIdx) => {
              const visibleItems = group.items.filter(isVisible)
              if (!visibleItems.length) return null

              const isGroupActive = hasActiveChild(visibleItems)
              const isExpanded = expandedGroups.has(group.title) || isGroupActive

              if (!group.title) {
                return (
                  <div key={groupIdx} className="space-y-1 pb-2">
                    {visibleItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.href}
                          onClick={() => navigate(item.href)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                            isItemActive(item)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </button>
                      )
                    })}
                  </div>
                )
              }

              return (
                <div key={groupIdx} className="space-y-1 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
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
                        const Icon = item.icon
                        return (
                          <button
                            key={item.href}
                            onClick={() => navigate(item.href)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                              isItemActive(item)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.title}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </ScrollArea>
          <div className="p-4 border-t">
            {isSuperAdmin ? (
              <>
                <div className="flex items-center justify-between rounded-md border bg-accent px-3 py-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 blur-[3px] opacity-50 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        All systems OK
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-muted-foreground leading-tight">
                        System operational
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-full border-0 text-[9px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                  >
                    ONLINE
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Current Session
                  </p>
                  <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                    <CalendarDays size={14} className="shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs font-semibold text-foreground">
                      {activeYearName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-1">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-[11px] font-semibold bg-primary text-primary-foreground">
                      {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-foreground">{user?.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground capitalize">{user?.role?.replace(/_/g, ' ')}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-accent"
                      >
                        <MoreHorizontal size={14} className="text-current" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-md p-1">
                      <DropdownMenuItem
                        className="rounded-md text-xs font-medium py-2"
                        onClick={() => {
                          closeMobileNav()
                          navigate('/app/settings')
                        }}
                      >
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem
                        className="rounded-md text-xs font-medium py-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
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
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader onOpenMobileNav={openMobileNav} />

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet
        open={mobileNavOpen}
        onOpenChange={(open) => (open ? openMobileNav() : closeMobileNav())}
      >
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="border-b px-6 py-4 text-left">
            <SheetTitle>{appConfig.appName}</SheetTitle>
          </SheetHeader>
          <ScrollArea className="px-4 py-6">
            {navigation.map((group, groupIdx) => {
              const visibleItems = group.items.filter(isVisible)
              if (!visibleItems.length) return null

              const isGroupActive = hasActiveChild(visibleItems)
              const isExpanded = expandedGroups.has(group.title) || isGroupActive

              if (!group.title) {
                return (
                  <div key={groupIdx} className="space-y-1 pb-2">
                    {visibleItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            navigate(item.href)
                            closeMobileNav()
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                            isItemActive(item)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </button>
                      )
                    })}
                  </div>
                )
              }

              return (
                <div key={groupIdx} className="space-y-1 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
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
                        const Icon = item.icon
                        return (
                          <button
                            key={item.href}
                            onClick={() => {
                              navigate(item.href)
                              closeMobileNav()
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                              isItemActive(item)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.title}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </ScrollArea>
          <div className="p-4 border-t">
            {isSuperAdmin ? (
              <>
                <div className="flex items-center justify-between rounded-md border bg-accent px-3 py-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 blur-[3px] opacity-50 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        All systems OK
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-muted-foreground leading-tight">
                        System operational
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-full border-0 text-[9px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                  >
                    ONLINE
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Current Session
                  </p>
                  <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                    <CalendarDays size={14} className="shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs font-semibold text-foreground">
                      {activeYearName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-1">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-[11px] font-semibold bg-primary text-primary-foreground">
                      {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-foreground">{user?.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground capitalize">{user?.role?.replace(/_/g, ' ')}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-accent"
                      >
                        <MoreHorizontal size={14} className="text-current" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-md p-1">
                      <DropdownMenuItem
                        className="rounded-md text-xs font-medium py-2"
                        onClick={() => {
                          closeMobileNav()
                          navigate('/app/settings')
                        }}
                      >
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem
                        className="rounded-md text-xs font-medium py-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
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
        </SheetContent>
      </Sheet>
    </div>
  )
}

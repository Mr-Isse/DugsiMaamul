/**
 * Route registry — future ERP modules register route objects here.
 * Keep Module 1 lean: only foundation + shell routes.
 */

export const publicRoutes = [
  {
    path: '/',
    lazyKey: 'home',
  },
]

export const authRoutes = [
  {
    path: '/login',
    lazyKey: 'login',
  },
]

export const protectedRoutes = [
  {
    path: '/dashboard',
    lazyKey: 'dashboard',
  },
  {
    path: '/admin/dashboard',
    lazyKey: 'super-admin-dashboard',
  },
  {
    path: '/app',
    lazyKey: 'app-shell',
  },
]

/**
 * Merge helper for future modules:
 * registerModuleRoutes(moduleRoutes)
 */
const moduleRouteRegistry = []

export function registerModuleRoutes(routes = []) {
  moduleRouteRegistry.push(...routes)
  return moduleRouteRegistry
}

export function getRegisteredModuleRoutes() {
  return [...moduleRouteRegistry]
}

// Register School Admin module routes
registerModuleRoutes([
  {
    path: 'students',
    lazy: () => import('@/pages/StudentsPage'),
    scope: 'protected',
  },
  {
    path: 'teachers',
    lazy: () => import('@/pages/TeachersPage'),
    scope: 'protected',
  },
  {
    path: 'classes',
    lazy: () => import('@/pages/ClassesPage'),
    scope: 'protected',
  },
])

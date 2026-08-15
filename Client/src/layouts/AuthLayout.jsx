import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { appConfig } from '@/config/app.config'

/**
 * Auth layout — spacious, brand-forward, no ERP chrome.
 */
export function AuthLayout() {
  return (
    <div className="relative min-h-dvh bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.9_0.05_255)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.92_0.08_85)_0%,_transparent_40%)] dark:bg-[radial-gradient(ellipse_at_top,_oklch(0.28_0.06_255)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.3_0.06_85)_0%,_transparent_40%)]"
        aria-hidden
      />
      <div className="relative flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-brand-navy" aria-hidden />
            <div>
              <p className="text-base font-semibold tracking-tight">
                {appConfig.appName}
              </p>
              <p className="text-xs text-muted-foreground">School Management</p>
            </div>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

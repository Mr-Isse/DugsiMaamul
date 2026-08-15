import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUi } from '@/hooks/useUi'
import { appConfig } from '@/config/app.config'

/**
 * Foundation landing — not the product Dashboard (Module 2).
 */
export function FoundationHomePage() {
  const { setPageTitle } = useUi()

  useEffect(() => {
    setPageTitle('Foundation')
  }, [setPageTitle])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-gold">Module 1</p>
        <h2 className="text-3xl font-semibold tracking-tight text-brand-navy dark:text-primary">
          {appConfig.appName} frontend foundation
        </h2>
        <p className="max-w-2xl text-muted-foreground">
          Core architecture is ready: routing, Redux Toolkit, RTK Query, Shadcn
          UI, theme, validation, and security foundations. Dashboard and ERP
          modules will be built next.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application shell</CardTitle>
            <CardDescription>
              Open the protected app layout used by future modules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/app">Open app shell</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication layout</CardTitle>
            <CardDescription>
              Preview the auth layout used by login and related routes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/login">Open login layout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SkeletonState, EmptyState } from '@/components/states'
import { useUi } from '@/hooks/useUi'
import { Separator } from '@/components/ui/separator'

/**
 * Protected shell placeholder — NOT the Module 2 Dashboard.
 */
export function AppShellPage() {
  const { setPageTitle } = useUi()

  useEffect(() => {
    setPageTitle('App shell')
  }, [setPageTitle])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Application shell
        </h2>
        <p className="max-w-2xl text-muted-foreground">
          This protected area is ready for ERP modules. The Dashboard design
          will be implemented in Module 2 using the Shadcn components already
          established here.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content area</CardTitle>
            <CardDescription>
              Spacious content container for future pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No module content yet"
              description="Students, Teachers, Finance, and Dashboard pages are intentionally not built in Module 1."
              className="py-10"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loading pattern</CardTitle>
            <CardDescription>
              Skeleton foundation for async views.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkeletonState rows={3} className="p-0" />
          </CardContent>
        </Card>
      </div>

      <Separator />

      <p className="text-sm text-muted-foreground">
        Header, responsive layout, and sidebar integration points are in place.
        Final sidebar navigation will follow later design decisions.
      </p>
    </div>
  )
}

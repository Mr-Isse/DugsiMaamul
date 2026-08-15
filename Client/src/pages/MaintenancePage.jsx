import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Construction, Mail } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <Card className="border-border/50">
              <CardContent className="p-10 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Construction className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Maintenance mode</h1>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                  The platform is temporarily under maintenance. Please check back shortly or contact support for assistance.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                  <Link to="/contact">
                    <Button size="lg">Contact support</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

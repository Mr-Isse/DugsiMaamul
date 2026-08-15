import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ShieldCheck } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center gap-3 text-primary">
              <FileText className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Terms of Service</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Using the Dugsimaamul platform</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              These terms describe the responsibilities of both the platform provider and the school or organization using the service.
            </p>

            <Card className="mt-10 border-border/50">
              <CardContent className="space-y-6 p-8 text-sm leading-7 text-muted-foreground">
                <p>
                  The platform is provided for school administration and educational management purposes. Schools remain responsible for the accuracy of their data, user access policies, and compliance with relevant laws and regulations.
                </p>
                <p>
                  Dugsimaamul may suspend or restrict access where misuse, abuse, or a violation of these terms is identified. Customers are expected to use the software responsibly and to protect their credentials and data.
                </p>
                <p>
                  Subscription and feature access are subject to the agreed plan and applicable service terms. Any custom deployment, data migration, or implementation support will be handled through a separate agreement where applicable.
                </p>
              </CardContent>
            </Card>

            <div className="mt-8 flex gap-3">
              <Link to="/contact">
                <Button size="lg">Ask about implementation</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

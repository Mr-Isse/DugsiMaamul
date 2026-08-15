import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Building2, Shield, Sparkles } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" /> About Dugsimaamul
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Helping schools modernize operations without losing focus on learning
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Dugsimaamul was built to give educational institutions a flexible, secure, and scalable platform for managing students, staff, payments, communication, and growth.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/contact">
                <Button size="lg">Contact the team</Button>
              </Link>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Purpose-built for education</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The platform supports school management from admissions to exams, attendance, finances, and parent communication in a unified experience.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Security and governance</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Every deployment models tenant isolation, permission-based access, and secure authentication so schools can trust the platform.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

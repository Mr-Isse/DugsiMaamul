import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowRight,
  BarChart3,
  Building2,
  GraduationCap,
  Lock,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

const pillars = [
  {
    title: 'Multi-tenant school operations',
    description: 'Run one platform for all branches, campuses, and departments while keeping each tenant isolated.',
    icon: Building2,
  },
  {
    title: 'Academics and admissions',
    description: 'Track students, classes, teachers, exams, attendance, and promotion history in one place.',
    icon: GraduationCap,
  },
  {
    title: 'Finance and reporting',
    description: 'Monitor fee collection, payments, budgets, and school performance from live dashboards.',
    icon: BarChart3,
  },
  {
    title: 'Secure experience',
    description: 'Protect data with RBAC, tenant-aware routing, and modern authentication workflows.',
    icon: Lock,
  },
]

export function PlatformPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-4 w-4" /> Platform Overview
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Enterprise-ready operations for modern schools
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Dugsimaamul brings academic, financial, and communication workflows together in a secure, tenant-aware platform that scales from single campuses to school networks.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/pricing">
                  <Button size="lg">View plans</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">Book a demo</Button>
                </Link>
              </div>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {pillars.map((pillar) => {
                const Icon = pillar.icon
                return (
                  <Card key={pillar.title} className="border-border/50">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground">{pillar.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-border/40 bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Built around the workflows schools already rely on
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                From student enrollment to finance and announcements, the platform is designed to replace disconnected tools with a single source of truth.
              </p>
            </div>
            <Card className="border-border/50">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3 rounded-xl bg-background p-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Student and parent records</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-background p-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Branded mobile experience</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-background p-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Live analytics and reports</span>
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

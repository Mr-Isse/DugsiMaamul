import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  GraduationCap,
  Users,
  BarChart3,
  Smartphone,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe,
  Database,
  Lock,
  Layout,
  Zap,
  CalendarDays,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

const stats = [
  { label: 'Schools Ready', value: '500+' },
  { label: 'Students Managed', value: '1M+' },
  { label: 'Uptime SLA', value: '99.9%' },
  { label: 'Countries', value: '12+' },
]

const features = [
  {
    icon: Users,
    title: 'Multi-Tenant Management',
    desc: 'Complete profiles, classes, and roles with total tenant isolation for security.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    desc: 'Real-time attendance tracking, exam results, and financial report cards.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    desc: 'JWT authentication, role-based access control, and encrypted data storage.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    icon: Smartphone,
    title: 'White-Label Mobile App',
    desc: 'Fully branded Expo apps for your school — available on Android & iOS.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
]

const faqs = [
  {
    q: 'Can I use only the dashboard without the mobile app?',
    a: 'Yes! Starter and Pro plans allow you to use the web dashboard without requiring the mobile app.',
  },
  {
    q: 'Is our school data isolated from others?',
    a: 'Absolutely. Dugsimaamul uses a strict multi-tenant architecture where each school\'s data is completely isolated using tenant-specific authentication.',
  },
  {
    q: 'How long does it take to get the branded mobile app?',
    a: 'Branded mobile apps are typically ready within 7-14 business days after we receive your school branding assets.',
  },
  {
    q: 'Do you support custom domains?',
    a: 'Yes, our Enterprise plan includes custom domain support (e.g., portal.yourschool.com) and dedicated infrastructure.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />

      {/* Main Content */}
      <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-background to-background dark:from-indigo-950/30 dark:via-background dark:to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] -z-10" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-4 h-4" />
            Modern School Management System
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-foreground tracking-tight max-w-5xl mx-auto leading-[0.95] mb-8">
            Dugsimaamul{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Platform
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Dugsimaamul is a premium multi-tenant SaaS platform that empowers schools with
            enterprise-grade dashboards, financial tools, and branded mobile ecosystems.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing">
              <Button size="lg" className="group text-base px-8 py-6">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/platform">
              <Button size="lg" variant="outline" className="text-base px-8 py-6">
                Explore Platform
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-24 relative max-w-6xl mx-auto">
            <Card className="border-border/50 shadow-2xl shadow-indigo-100/50 dark:shadow-cyan-500/10">
              <CardContent className="p-2">
                <div className="rounded-xl overflow-hidden border border-border aspect-[16/9] relative group bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
                    alt="School Management Dashboard"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/1200x675/f8fafc/64748b?text=Interactive+Dashboard+Preview"
                    }}
                  />
                  <div className="absolute inset-0 bg-indigo-600/10 dark:bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="px-6 py-3 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground font-semibold shadow-lg">
                      Experience the Interface
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
              Everything Your School Needs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Choose between a powerful web dashboard or start with your branded mobile app.
              Dugsimaamul scales with your school.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card
                key={f.title}
                className="group hover:border-indigo-200 dark:hover:border-cyan-500/40 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6', f.bg)}>
                    <f.icon className={cn('w-7 h-7', f.color)} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Ecosystem Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-background via-indigo-50/30 to-background dark:from-background dark:via-indigo-950/30 dark:to-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-indigo-600 dark:text-cyan-400 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">
                Mobile Ecosystem
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-8 leading-tight">
                A Branded App for{' '}
                <span className="text-indigo-600">Your Institution</span>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Smartphone, t: 'Android & iOS', d: 'Native apps built from scratch with your school branding.' },
                  { icon: Zap, t: 'Push Notifications', d: 'Instant alerts for parents about attendance & fees.' },
                  { icon: Lock, t: 'Secure Access', d: 'Role-based login for students, parents, and staff.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                      <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.t}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/pricing">
                <Button className="mt-10" size="lg">
                  View Mobile Plans <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-indigo-500/10 dark:bg-cyan-500/20 blur-[100px] rounded-full -z-10" />
              <div className="relative aspect-[9/19] max-w-[280px] rounded-[3rem] border-8 border-border bg-card overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-card rounded-b-2xl z-20" />
                <img
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop"
                  alt="Branded School App"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/400x800/0f172a/white?text=Premium+School+App"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent flex flex-col items-center justify-end p-8 text-center">
                  <div className="mb-4 p-3 rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/20">
                    <Smartphone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Your School App</h3>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                    Branded & Published
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground text-center mb-16">
            Common Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="hover:border-indigo-100 dark:hover:border-white/10 transition-all">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 text-center bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-8 tracking-tight leading-tight">
            Ready to transform <br />
            your school?
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Join hundreds of schools using Dugsimaamul to automate their operations
            and delight their community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing">
              <Button size="lg" className="text-base px-8 py-6">
                See Plans & Pricing
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-base px-8 py-6">
                Talk to an Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </main>

      <PublicFooter />
    </div>
  )
}

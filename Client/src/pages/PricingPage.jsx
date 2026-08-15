import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  BookOpen,
  GitBranch,
  HardDrive,
  Shield,
  Zap,
  BarChart3,
  Smartphone,
  Globe,
  Headphones,
  Star,
  Loader2,
} from 'lucide-react'
import { useGetAvailablePlansQuery } from '@/services/api'
import { cn } from '@/lib/utils'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

const HARDCODED_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    code: 'STARTER',
    tagline: 'Perfect for small schools',
    monthlyPrice: 49,
    yearlyPrice: 470,
    color: 'from-blue-500 to-cyan-500',
    isPopular: false,
    limits: { students: 500, teachers: 20, branches: 1, storage: 5 },
    features: [
      { text: '500 Students', included: true },
      { text: '20 Teachers', included: true },
      { text: '1 Branch', included: true },
      { text: '5 GB Storage', included: true },
      { text: 'Attendance Management', included: true },
      { text: 'Fee & Payments', included: true },
      { text: 'Exam & Results', included: true },
      { text: 'Email Support', included: true },
      { text: 'Mobile Apps', included: false },
      { text: 'Multi-Branch Management', included: false },
      { text: 'Advanced Analytics', included: false },
      { text: 'Priority Support', included: false },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/contact?plan=starter',
  },
  {
    id: 'professional',
    name: 'Professional',
    code: 'PROFESSIONAL',
    tagline: 'For growing institutions',
    monthlyPrice: 129,
    yearlyPrice: 1238,
    color: 'from-indigo-500 to-purple-600',
    isPopular: true,
    limits: { students: 2000, teachers: 100, branches: 5, storage: 25 },
    features: [
      { text: '2,000 Students', included: true },
      { text: '100 Teachers', included: true },
      { text: '5 Branches', included: true },
      { text: '25 GB Storage', included: true },
      { text: 'Attendance Management', included: true },
      { text: 'Fee & Payments', included: true },
      { text: 'Exam & Results', included: true },
      { text: 'Priority Email & Chat Support', included: true },
      { text: 'Mobile Apps (Parent, Student, Teacher)', included: true },
      { text: 'Multi-Branch Management', included: true },
      { text: 'Advanced Analytics', included: false },
      { text: 'Dedicated Account Manager', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/contact?plan=professional',
  },
  {
    id: 'business',
    name: 'Business',
    code: 'BUSINESS',
    tagline: 'For large school networks',
    monthlyPrice: 299,
    yearlyPrice: 2870,
    color: 'from-violet-600 to-pink-600',
    isPopular: false,
    limits: { students: 10000, teachers: 500, branches: 20, storage: 100 },
    features: [
      { text: '10,000 Students', included: true },
      { text: '500 Teachers', included: true },
      { text: '20 Branches', included: true },
      { text: '100 GB Storage', included: true },
      { text: 'Attendance Management', included: true },
      { text: 'Fee & Payments', included: true },
      { text: 'Exam & Results', included: true },
      { text: 'Priority Email & Chat Support', included: true },
      { text: 'Mobile Apps (Parent, Student, Teacher)', included: true },
      { text: 'Multi-Branch Management', included: true },
      { text: 'Advanced Analytics Dashboard', included: true },
      { text: 'Dedicated Account Manager', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact?plan=business',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    code: 'ENTERPRISE',
    tagline: 'Unlimited & fully custom',
    monthlyPrice: null,
    yearlyPrice: null,
    color: 'from-slate-700 to-slate-900',
    isPopular: false,
    limits: { students: -1, teachers: -1, branches: -1, storage: -1 },
    features: [
      { text: 'Unlimited Students', included: true },
      { text: 'Unlimited Teachers', included: true },
      { text: 'Unlimited Branches', included: true },
      { text: 'Unlimited Storage', included: true },
      { text: 'All Features Included', included: true },
      { text: 'Custom Domain & Branding', included: true },
      { text: 'Dedicated Cloud Infrastructure', included: true },
      { text: '24/7 Priority Support & SLA', included: true },
      { text: 'Custom Mobile App Branding', included: true },
      { text: 'On-Premise Deployment Options', included: true },
      { text: 'Full Analytics & Reporting', included: true },
      { text: 'Dedicated Account Manager + Engineer', included: true },
    ],
    cta: 'Talk to Sales',
    ctaLink: '/contact?plan=enterprise',
  },
]

const ALL_FEATURES_COMPARISON = [
  { category: 'Capacity', items: [
    { name: 'Students', starter: '500', professional: '2,000', business: '10,000', enterprise: 'Unlimited' },
    { name: 'Teachers', starter: '20', professional: '100', business: '500', enterprise: 'Unlimited' },
    { name: 'Branches', starter: '1', professional: '5', business: '20', enterprise: 'Unlimited' },
    { name: 'Storage', starter: '5 GB', professional: '25 GB', business: '100 GB', enterprise: 'Unlimited' },
  ]},
  { category: 'Core Modules', items: [
    { name: 'Students & Enrollment', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Online Admissions / Registration', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Attendance (Students)', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Attendance (Teachers)', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Exams & Results', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Fee & Payment Management', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Timetable / Schedule', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Announcements & Events', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Library Management', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Hostel Management', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Transport Management', starter: false, professional: false, business: true, enterprise: true },
  ]},
  { category: 'Mobile & Access', items: [
    { name: 'Parent Mobile App', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Student Mobile App', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Teacher Mobile App', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Push Notifications', starter: false, professional: true, business: true, enterprise: true },
    { name: 'Custom App Branding', starter: false, professional: false, business: false, enterprise: true },
  ]},
  { category: 'Analytics & Reports', items: [
    { name: 'Basic Reports', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Finance Reports', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Advanced Analytics Dashboard', starter: false, professional: false, business: true, enterprise: true },
    { name: 'Data Export (CSV / Excel)', starter: true, professional: true, business: true, enterprise: true },
  ]},
  { category: 'Support & Infrastructure', items: [
    { name: 'Email Support', starter: true, professional: true, business: true, enterprise: true },
    { name: 'Live Chat Support', starter: false, professional: true, business: true, enterprise: true },
    { name: '24/7 Priority Support + SLA', starter: false, professional: false, business: false, enterprise: true },
    { name: 'Dedicated Account Manager', starter: false, professional: false, business: true, enterprise: true },
    { name: 'Custom Domain', starter: false, professional: false, business: false, enterprise: true },
    { name: 'On-Premise Deployment', starter: false, professional: false, business: false, enterprise: true },
    { name: 'Dedicated Cloud Infrastructure', starter: false, professional: false, business: false, enterprise: true },
  ]},
]

const CheckCell = ({ val }) => {
  if (val === true) return (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Check className="w-3.5 h-3.5 text-emerald-500" />
      </div>
    </div>
  )
  if (val === false) return (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
        <X className="w-3.5 h-3.5 text-rose-500" />
      </div>
    </div>
  )
  return <span className="text-sm font-semibold text-foreground">{val}</span>
}

export function PricingPage() {
  const [yearly, setYearly] = useState(false)
  const { data: apiPlansRes, isLoading } = useGetAvailablePlansQuery()
  const apiPlans = apiPlansRes?.data || []

  const plansToDisplay = apiPlans.length > 0 ? apiPlans.map((apiPlan, index) => {
    const basePlan = HARDCODED_PLANS.find(p => p.code === apiPlan.code) || HARDCODED_PLANS[index % HARDCODED_PLANS.length]

    return {
      ...basePlan,
      id: apiPlan._id,
      name: apiPlan.name,
      code: apiPlan.code,
      monthlyPrice: apiPlan.monthlyPrice,
      yearlyPrice: apiPlan.yearlyPrice,
      isPopular: apiPlan.isRecommended,
      limits: apiPlan.limits,
      features: (apiPlan.features || basePlan.features).map(f => ({ text: f.name || f.text, included: f.included, code: f.code })),
      ctaLink: `/contact?plan=${apiPlan.code.toLowerCase()}`
    }
  }) : HARDCODED_PLANS

  const displayLimit = (val, key) => {
    if (val === -1 || val === 999999) return 'Unlimited'
    if (!val && val !== 0) return '0'
    if (key === 'storage') {
      return val >= 1000 ? `${(val / 1024).toFixed(0)} TB` : `${val} GB`
    }
    return val.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-none text-foreground">
            Plans for every<br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
              school size
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            Start with a 14-day free trial on any plan. No credit card required.
            Scale seamlessly as your institution grows.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-muted border border-border rounded-full p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-bold transition-all duration-300',
                !yearly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2',
                yearly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-32">
          {plansToDisplay.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col border transition-all duration-300 bg-card',
                plan.isPopular && 'ring-2 ring-primary shadow-lg'
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  {plan.tagline}
                </p>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Pricing */}
                <div className="mb-6 min-h-[60px] flex items-end">
                  {plan.monthlyPrice !== null && plan.monthlyPrice !== undefined ? (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-foreground">
                          ${yearly && plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                        </span>
                        <span className="text-muted-foreground font-bold text-base">/mo</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-amber-500">Custom</span>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">
                        Tailored to your needs
                      </p>
                    </div>
                  )}
                </div>

                {/* Limit Highlights */}
                <div className="grid grid-cols-2 gap-2.5 p-4 bg-muted/50 rounded-xl border border-border mb-6">
                  {[
                    { icon: Users, key: 'students', label: 'Students' },
                    { icon: BookOpen, key: 'teachers', label: 'Teachers' },
                    { icon: GitBranch, key: 'branches', label: 'Branches' },
                    { icon: HardDrive, key: 'storage', label: 'Storage' },
                  ].map(({ icon: Icon, key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-[10px] font-bold text-muted-foreground truncate">
                        {displayLimit(plan.limits?.[key], key)} {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1 overflow-y-auto max-h-[400px] pr-2">
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      className={cn(
                        'flex items-start gap-2 text-[10px] font-bold',
                        f.included ? 'text-foreground' : 'text-muted-foreground line-through'
                      )}
                    >
                      <div className={cn(
                        'mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center',
                        f.included ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                      )}>
                        {f.included
                          ? <Check className="w-2 h-2 text-emerald-500" />
                          : <X className="w-2 h-2 text-rose-500" />
                        }
                      </div>
                      <span className="leading-tight">{f.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to={plan.ctaLink} className="block">
                  <Button
                    className={cn(
                      'w-full text-xs font-bold uppercase tracking-widest',
                      plan.isPopular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    )}
                  >
                    {plan.cta === 'Start Free Trial' ? 'Register' : plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 uppercase">
              Full Feature Comparison
            </h2>
            <p className="text-muted-foreground">See exactly what's included in each plan</p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest w-1/3">
                      Feature
                    </th>
                    {plansToDisplay.map(p => (
                      <th
                        key={p.id}
                        className={cn(
                          'px-4 py-5 text-center text-xs font-bold uppercase tracking-widest',
                          p.isPopular && 'text-primary'
                        )}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_FEATURES_COMPARISON.map((category) => (
                    <tr key={category.category} className="bg-muted/30">
                      <td
                        colSpan={plansToDisplay.length + 1}
                        className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest border-y border-border"
                      >
                        {category.category}
                      </td>
                    </tr>
                  ))}
                  {ALL_FEATURES_COMPARISON.map((category) => (
                    category.items.map((item, idx) => (
                      <tr key={`${category.category}-${item.name}`} className="border-t border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {item.name}
                        </td>
                        {plansToDisplay.map(plan => (
                          <td
                            key={plan.id}
                            className={cn(
                              'px-4 py-4 text-center border-l border-border',
                              plan.isPopular && 'bg-primary/5'
                            )}
                          >
                            <CheckCell val={item[plan.code.toLowerCase()] || item[plan.id]} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Infrastructure Features */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 uppercase">
              Built for Modern Schools
            </h2>
            <p className="text-muted-foreground">
              Every plan includes enterprise-grade infrastructure
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Enterprise Security', desc: 'RBAC, JWT Auth, and bank-grade encryption on every tier.' },
              { icon: Zap, title: 'Multi-Tenant Isolation', desc: 'Complete data isolation between schools. No leakage, ever.' },
              { icon: BarChart3, title: 'Real-time Reports', desc: 'Instant attendance, finance, and academic analytics.' },
              { icon: Smartphone, title: 'Mobile Ready', desc: 'Native apps for parents, students, and teachers.' },
              { icon: Globe, title: 'Multi-Language', desc: 'Supports Arabic, English, Somali, and more.' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'Human support available via chat, email, and phone.' },
              { icon: GitBranch, title: 'Multi-Branch', desc: 'Manage unlimited branches from a single dashboard.' },
              { icon: BarChart3, title: 'Audit Logs', desc: 'Every action is tracked for compliance and accountability.' },
            ].map((item, idx) => (
              <Card key={idx} className="hover:border-primary/20 transition-all">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-sm mb-2 text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-12 lg:p-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              14-Day Free Trial
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-foreground">
              Ready to transform<br />your school?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Join hundreds of schools using DugsiKabe to manage their institution efficiently.
              Start your free trial today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact?plan=professional">
                <Button size="lg" className="flex items-center gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Talk to Sales
                </Button>
              </Link>
            </div>
            <p className="text-muted-foreground text-xs mt-8 font-medium">
              No credit card required &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; Setup in minutes
            </p>
          </CardContent>
        </Card>
      </div>
      </main>
      
      <PublicFooter />
    </div>
  )
}

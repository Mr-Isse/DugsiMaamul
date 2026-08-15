import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  Brain, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Briefcase, 
  HardDrive,
  Users
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const modules = [
  {
    title: 'AI Learning Assistant',
    description: 'Smart insights and anomaly predictions for student behavior and performance.',
    icon: <Brain className="h-8 w-8 text-indigo-500" />,
    path: '/app/enterprise/ai',
    color: 'border-indigo-100 hover:border-indigo-300 dark:border-indigo-950 dark:hover:border-indigo-800'
  },
  {
    title: 'Business Intelligence',
    description: 'Executive dashboards, KPIs, and advanced cross-module data analytics.',
    icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
    path: '/app/enterprise/bi',
    color: 'border-blue-100 hover:border-blue-300 dark:border-blue-950 dark:hover:border-blue-800'
  },
  {
    title: 'Automation Engine',
    description: 'Manage automated scheduled jobs, system cron tasks, and workflow rules.',
    icon: <Zap className="h-8 w-8 text-purple-500" />,
    path: '/app/enterprise/automation',
    color: 'border-purple-100 hover:border-purple-300 dark:border-purple-950 dark:hover:border-purple-800'
  },
  {
    title: 'Enterprise Finance',
    description: 'Advanced accounting, revenue forecasting, and complex procurement.',
    icon: <Briefcase className="h-8 w-8 text-green-500" />,
    path: '/app/enterprise/finance',
    color: 'border-green-100 hover:border-green-300 dark:border-green-950 dark:hover:border-green-800'
  },
  {
    title: 'Advanced Security',
    description: 'API keys, IP restrictions, deep audit logs, and custom password policies.',
    icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
    path: '/app/enterprise/security',
    color: 'border-red-100 hover:border-red-300 dark:border-red-950 dark:hover:border-red-800'
  },
  {
    title: 'Data & Recovery',
    description: 'Storage metrics, automated backups, and data disaster recovery center.',
    icon: <HardDrive className="h-8 w-8 text-amber-500" />,
    path: '/app/enterprise/recovery',
    color: 'border-amber-100 hover:border-amber-300 dark:border-amber-950 dark:hover:border-amber-800'
  }
]

export default function EnterpriseSuitePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Enterprise Suite
          </h1>
          <p className="text-muted-foreground mt-1">
            Access advanced enterprise-grade modules available on your current plan.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod, idx) => (
          <Link key={idx} to={mod.path} className="block group">
            <Card className={`h-full transition-all duration-200 border-2 ${mod.color} hover:shadow-md bg-card/50 hover:bg-card`}>
              <CardHeader>
                <div className="mb-2 p-2 w-fit rounded-lg bg-background shadow-sm border">
                  {mod.icon}
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {mod.title}
                </CardTitle>
                <CardDescription className="pt-2 line-clamp-2">
                  {mod.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

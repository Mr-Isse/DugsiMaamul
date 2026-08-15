import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar,
} from 'lucide-react'

const iconMap = {
  'users': Users,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  'dollar-sign': DollarSign,
  'percent': Percent,
  'calendar': Calendar,
}

export function KPICard({ title, value, icon, trend, description, className }) {
  const Icon = iconMap[icon] || Users
  const isPositive = trend && (trend.includes('+') || trend.includes('increased'))

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {trend}
            </span>
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function KPICardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-32 mt-3" />
      </CardContent>
    </Card>
  )
}

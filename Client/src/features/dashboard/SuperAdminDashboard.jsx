import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useGetBusinessMetricsQuery } from '@/services/api/dashboardApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { KPICard } from './components/KPICard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export default function SuperAdminDashboard() {
  const { user } = useSelector((state) => state.auth)
  
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetBusinessMetricsQuery()

  useEffect(() => {
    refetch()
  }, [refetch])

  if (isLoading) {
    return <SuperAdminDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load dashboard data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = dashboardData?.data || {}

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform-wide overview and management
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          {stats.maintenanceMode ? (
            <span className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              Maintenance Mode
            </span>
          ) : (
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              System Normal
            </span>
          )}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Schools"
          value={stats.schools?.total || 0}
          icon="book-open"
          trend={`+${stats.schools?.recent || 0} this month`}
          description="Registered schools"
        />
        <KPICard
          title="Active Schools"
          value={stats.schools?.active || 0}
          icon="users"
          description="Currently active"
        />
        <KPICard
          title="Total Students"
          value={stats.platform?.totalStudents || 0}
          icon="graduation-cap"
          description="Platform-wide count"
        />
        <KPICard
          title="Total Revenue"
          value={`$${((stats.revenue?.total || 0) / 1000).toFixed(1)}K`}
          icon="dollar-sign"
          trend={`$${((stats.revenue?.paid || 0) / 1000).toFixed(1)}K collected`}
          description="Platform revenue"
        />
      </div>

      {/* School Health Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Expired Subscriptions"
          value={stats.schools?.expired || 0}
          icon="alert-circle"
          description="Need renewal"
        />
        <KPICard
          title="Blocked Schools"
          value={stats.schools?.blocked || 0}
          icon="x-circle"
          description="Admin blocked"
        />
        <KPICard
          title="Total Teachers"
          value={stats.platform?.totalTeachers || 0}
          icon="graduation-cap"
          description="Platform-wide count"
        />
        <KPICard
          title="Inactive Schools"
          value={stats.schools?.inactive || 0}
          icon="moon"
          description="Not currently active"
        />
      </div>

      {/* Top Schools by Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Top Schools by Student Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topSchools && stats.topSchools.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {stats.topSchools.map((school, index) => (
                  <div
                    key={school._id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {school.subdomain}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{school.studentCount}</p>
                        <p className="text-xs text-muted-foreground">students</p>
                      </div>
                      <Badge variant={school.status === 'Active' ? 'default' : 'secondary'}>
                        {school.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No school data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Types Breakdown */}
      {stats.subscriptionTypes && stats.subscriptionTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Subscription Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.subscriptionTypes.map((sub) => (
                <div key={sub._id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium capitalize">{sub._id || 'Unknown'}</p>
                    <Badge variant="secondary">{sub.count}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Schools subscribed
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SuperAdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 ml-4 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

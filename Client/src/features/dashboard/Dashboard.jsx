import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useGetDashboardStatsQuery } from '@/services/api/dashboardApi'
import { useGetAcademicYearsQuery } from '@/services/api/academicApi'
import { useGetBranchesQuery } from '@/services/api/branchesApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { KPICard } from './components/KPICard'
import { RevenueChart } from './components/RevenueChart'
import { StudentDistributionChart } from './components/StudentDistributionChart'
import { RecentActivities } from './components/RecentActivities'
import { StarStudents } from './components/StarStudents'
import { QuickActions } from './components/QuickActions'
import { RevenuePerClass } from './components/RevenuePerClass'
import { setAcademicYears } from '@/store/slices/academicSlice'
import { setTenant } from '@/store/slices/tenantSlice'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const DASHBOARD_STORAGE_KEY = 'dashboard_data'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { academicYears } = useSelector((state) => state.academic)
  const { branches } = useSelector((state) => state.tenant)
  const [isUsingCachedData, setIsUsingCachedData] = useState(false)
  
  // Fetch dashboard stats
  const {
    data: dashboardData,
    isLoading: isLoadingStats,
    error,
    refetch,
  } = useGetDashboardStatsQuery()

  // Fetch academic years for school admin
  const { data: academicYearsData } = useGetAcademicYearsQuery(undefined, {
    skip: user?.role === 'superadmin' || user?.role === 'super_admin',
  })

  // Fetch branches for school admin
  const { data: branchesData } = useGetBranchesQuery(undefined, {
    skip: user?.role === 'superadmin' || user?.role === 'super_admin',
  })

  // Load cached data on mount
  useEffect(() => {
    const cached = localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (cached && !dashboardData && !isLoadingStats) {
      try {
        const parsed = JSON.parse(cached)
        const age = Date.now() - parsed.timestamp
        if (age < CACHE_DURATION) {
          setIsUsingCachedData(true)
          toast.info('Data has been read from cache', {
            description: 'Showing cached dashboard data from previous session',
          })
        }
      } catch (e) {
        localStorage.removeItem(DASHBOARD_STORAGE_KEY)
      }
    }
  }, [dashboardData, isLoadingStats])

  // Save dashboard data to localStorage when successfully fetched
  useEffect(() => {
    if (dashboardData?.data) {
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify({
        data: dashboardData.data,
        timestamp: Date.now(),
      }))
      setIsUsingCachedData(false)
      toast.success('Data has been read', {
        description: 'Dashboard data loaded successfully',
      })
    }
  }, [dashboardData])

  // Store academic years in Redux when fetched
  useEffect(() => {
    if (academicYearsData?.data && academicYearsData.data.length > 0) {
      dispatch(setAcademicYears(academicYearsData.data))
    }
  }, [academicYearsData, dispatch])

  // Store branches in Redux when fetched
  useEffect(() => {
    if (branchesData?.data && branchesData.data.length > 0) {
      dispatch(setTenant({
        branches: branchesData.data,
      }))
    }
  }, [branchesData, dispatch])

  const isLoading = isLoadingStats

  // Get stats from either fresh data or cache
  const getCachedStats = () => {
    try {
      const cached = localStorage.getItem(DASHBOARD_STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        return parsed.data
      }
    } catch (e) {
      return null
    }
    return null
  }

  const stats = dashboardData?.data || getCachedStats() || {}

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="max-w-md">
          <CardContent className="pt-6 space-y-4">
            <p className="text-center text-muted-foreground">
              Failed to load dashboard data. Please try again.
            </p>
            <Button 
              onClick={() => {
                localStorage.removeItem(DASHBOARD_STORAGE_KEY)
                navigate('/login')
              }}
              className="w-full"
            >
              Login again to update the data
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Admin'}
          </p>
        </div>
        <QuickActions />
      </div>

      {/* KPI Cards - Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon="users"
          description="Active students"
        />
        <KPICard
          title="Total Teachers"
          value={stats.totalTeachers || 0}
          icon="graduation-cap"
          description="Active teachers"
        />
        <KPICard
          title="Total Classes"
          value={stats.totalClasses || 0}
          icon="book-open"
          description="Active classes"
        />
        <KPICard
          title="Attendance Rate"
          value={`${stats.attendanceRate || 0}%`}
          icon="percent"
          trend="Last 30 days"
          description="Average attendance"
        />
      </div>

      {/* KPI Cards - Second Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`$${((stats.totalRevenue || 0) / 1000).toFixed(1)}K`}
          icon="dollar-sign"
          trend={stats.monthlyRevenue ? `+$${((stats.monthlyRevenue || 0) / 1000).toFixed(1)}K this month` : null}
          description="Total collected"
        />
        <KPICard
          title="Today's Revenue"
          value={`$${((stats.todayRevenue || 0) / 1000).toFixed(1)}K`}
          icon="calendar"
          description="Collected today"
        />
        <KPICard
          title="Paid Students"
          value={stats.paidVsUnpaid?.paid || 0}
          icon="users"
          description="Fees paid this month"
        />
        <KPICard
          title="Unpaid Students"
          value={stats.paidVsUnpaid?.unpaid || 0}
          icon="users"
          description="Pending payments"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChart data={stats.revenueData || []} className="col-span-4" />
        <StudentDistributionChart
          totalStudents={stats.totalStudents || 0}
          paidCount={stats.paidVsUnpaid?.paid || 0}
          unpaidCount={stats.paidVsUnpaid?.unpaid || 0}
          className="col-span-3"
        />
      </div>

      {/* Revenue Per Class */}
      {stats.revenuePerClass && stats.revenuePerClass.length > 0 && (
        <RevenuePerClass data={stats.revenuePerClass} />
      )}

      {/* Tables Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <StarStudents classRanks={stats.classRanks || []} />
        <RecentActivities recentActions={stats.recentActions || []} />
      </div>

      {/* Branch Stats (for School Admin) */}
      {stats.branchStats && stats.branchStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Branch Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.branchStats.map((branch) => (
                <div
                  key={branch.name}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {branch.students} students • {branch.teachers} teachers
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${((branch.revenue || 0) / 1000).toFixed(1)}K
                    </p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* KPI Cards - Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* KPI Cards - Second Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Revenue Per Class */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tables Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

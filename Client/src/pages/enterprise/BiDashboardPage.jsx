import React from 'react'
import { BarChart3, PieChart, TrendingUp, DollarSign, Users, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetExecutiveDashboardQuery } from '@/services/api/biApi'

export default function BiDashboardPage() {
  const { data: response, isLoading } = useGetExecutiveDashboardQuery()
  const stats = response?.data || {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground">
            High-level business intelligence and key performance indicators.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">${stats.totalRevenue?.toLocaleString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">+12.5% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{stats.totalEnrollment?.toLocaleString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">+4.2% from last term</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Academic Performance</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{stats.averageGrade || 'B+'}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">School-wide average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{stats.collectionRate || '0'}%</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Fees collected vs expected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 min-h-[300px]">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Monthly revenue vs expenses</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <PieChart className="h-16 w-16 mb-4 text-muted/20" />
                <p>Chart data will be visualized here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 min-h-[300px]">
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <CardDescription>Historical student population growth</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <BarChart3 className="h-16 w-16 mb-4 text-muted/20" />
                <p>Chart data will be visualized here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

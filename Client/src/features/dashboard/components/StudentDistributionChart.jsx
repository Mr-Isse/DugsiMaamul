import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from 'recharts'
import { CreditCard } from 'lucide-react'

const chartConfig = {
  paid: {
    label: 'Paid',
    color: 'hsl(142 76% 36%)',
  },
  unpaid: {
    label: 'Unpaid',
    color: 'hsl(0 84% 60%)',
  },
}

export function StudentDistributionChart({ totalStudents, paidCount, unpaidCount, className }) {
  const data = [
    { name: 'Paid', value: paidCount, fill: 'var(--color-paid)' },
    { name: 'Unpaid', value: unpaidCount, fill: 'var(--color-unpaid)' },
  ]

  if (totalStudents === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No student data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const paidPercentage = totalStudents > 0 ? ((paidCount / totalStudents) * 100).toFixed(1) : 0
  const unpaidPercentage = totalStudents > 0 ? ((unpaidCount / totalStudents) * 100).toFixed(1) : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Fee Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell key="cell-paid" fill="var(--color-paid)" />
                <Cell key="cell-unpaid" fill="var(--color-unpaid)" />
              </Pie>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                formatter={(value) => `${value} students`}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600" />
              <span className="text-sm font-medium">Paid</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-700 dark:text-green-400">{paidCount}</p>
              <p className="text-xs text-muted-foreground">{paidPercentage}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-600" />
              <span className="text-sm font-medium">Unpaid</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-red-700 dark:text-red-400">{unpaidCount}</p>
              <p className="text-xs text-muted-foreground">{unpaidPercentage}%</p>
            </div>
          </div>
          <div className="text-center pt-2 border-t">
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudentDistributionChartSkeleton({ className }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[220px] w-full" />
        <div className="space-y-3 mt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

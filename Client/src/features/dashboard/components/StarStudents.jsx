import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Award } from 'lucide-react'

export function StarStudents({ classRanks }) {
  if (!classRanks || classRanks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-3">
            {classRanks.map((classRank, index) => (
              <div
                key={classRank.classId}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{classRank.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {classRank.studentCount} students
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                    {classRank.averageMarks}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function StarStudentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function SkeletonState({ rows = 4, className }) {
  return (
    <div className={cn('space-y-4 p-6', className)} aria-busy="true">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

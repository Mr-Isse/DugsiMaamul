import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoadingState({
  label = 'Loading…',
  className,
  fullPage = false,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-muted-foreground',
        fullPage ? 'min-h-[50vh] py-16' : 'py-10',
        className
      )}
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  )
}

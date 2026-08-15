import { WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function NetworkErrorState({
  title = 'Connection problem',
  description = 'Unable to reach the server. Please check your internet connection and try again.',
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-16 text-center',
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 text-muted-foreground">
        <WifiOff className="size-8" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-2" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}

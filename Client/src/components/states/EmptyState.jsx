import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function EmptyState({
  title = 'Nothing here yet',
  description = 'There is no data to display.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-16 text-center',
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 text-muted-foreground">
        <Inbox className="size-8" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

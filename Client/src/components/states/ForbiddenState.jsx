import { ShieldOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ForbiddenState({
  title = 'Access denied',
  description = 'You do not have permission to view this page. Backend authorization remains the source of truth.',
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
        <ShieldOff className="size-8" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      <Button asChild variant="outline" className="mt-2">
        <Link to="/">Go home</Link>
      </Button>
    </div>
  )
}

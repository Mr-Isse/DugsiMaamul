import { LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function UnauthorizedState({
  title = 'Authentication required',
  description = 'Please sign in to continue.',
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
        <LockKeyhole className="size-8" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      <Button asChild className="mt-2">
        <Link to="/login">Sign in</Link>
      </Button>
    </div>
  )
}

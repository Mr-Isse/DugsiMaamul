import { cn } from '@/lib/utils'

export function ContentContainer({ className, children, ...props }) {
  return (
    <div
      className={cn('mx-auto w-full max-w-7xl space-y-8', className)}
      {...props}
    >
      {children}
    </div>
  )
}

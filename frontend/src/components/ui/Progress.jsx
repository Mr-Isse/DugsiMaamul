import React from 'react';
import { cn } from '../../lib/utils';

const Progress = React.forwardRef(({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        'relative w-full h-2 rounded-full overflow-hidden',
        'bg-white/10',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          'bg-gradient-to-r from-indigo-500 to-purple-500',
          indicatorClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress };

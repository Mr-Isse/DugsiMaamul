import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names safely.
 * @param {...import('clsx').ClassValue} inputs
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

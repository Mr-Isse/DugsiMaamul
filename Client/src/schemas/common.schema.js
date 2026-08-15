import { z } from 'zod'

/**
 * Reusable Zod primitives aligned with common backend validation rules.
 * Module-specific schemas should compose these — do not invent backend rules.
 */

export const mongoIdSchema = z
  .string({ error: 'ID is required' })
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format')

export const optionalMongoIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format')
  .optional()
  .or(z.literal(''))

export const emailSchema = z
  .string({ error: 'Email is required' })
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long')

export const passwordSchema = z
  .string({ error: 'Password is required' })
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password is too long')

export const strongPasswordSchema = z
  .string({ error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number')

/**
 * Phone: digits, spaces, +, -, () — backend may tighten further per locale.
 */
export const phoneSchema = z
  .string({ error: 'Phone number is required' })
  .trim()
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .regex(/^[+]?[\d\s()-]+$/, 'Please enter a valid phone number')

export const optionalPhoneSchema = phoneSchema.optional().or(z.literal(''))

/**
 * Numbers that reject inappropriate text/symbols via coerce + refine.
 */
export const positiveNumberSchema = z.coerce
  .number({
    error: 'Please enter a valid number',
  })
  .finite('Please enter a valid number')
  .nonnegative('Value cannot be negative')

export const integerSchema = z.coerce
  .number({
    error: 'Please enter a valid whole number',
  })
  .int('Please enter a whole number')
  .finite()

export const requiredStringSchema = (label = 'This field') =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)

export const dateStringSchema = z
  .string({ error: 'Date is required' })
  .min(1, 'Date is required')
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  })

export const optionalDateStringSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || !Number.isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  })

/**
 * Example login schema for foundation verification.
 * Auth module will refine against exact backend rules later.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
})

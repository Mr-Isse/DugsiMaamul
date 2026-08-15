import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

/**
 * Standard React Hook Form + Zod setup for app forms.
 * @param {import('zod').ZodTypeAny} schema
 * @param {object} [options]
 */
export function useAppForm(schema, options = {}) {
  const { defaultValues, mode = 'onBlur', ...rest } = options

  return useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
    ...rest,
  })
}

/**
 * Map backend validation errors onto RHF fields when present.
 * Expected shapes: { field: message } or [{ path/field, message }]
 */
export function applyServerErrors(setError, validationErrors) {
  if (!validationErrors || !setError) return

  if (Array.isArray(validationErrors)) {
    validationErrors.forEach((item) => {
      const field = item.path || item.field || item.param
      const message = item.message || item.msg || 'Invalid value'
      if (field) {
        setError(field, { type: 'server', message })
      }
    })
    return
  }

  if (typeof validationErrors === 'object') {
    Object.entries(validationErrors).forEach(([field, message]) => {
      setError(field, {
        type: 'server',
        message: Array.isArray(message) ? message[0] : String(message),
      })
    })
  }
}

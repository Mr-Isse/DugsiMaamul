/**
 * XSS / unsafe HTML prevention helpers.
 * Never use dangerouslySetInnerHTML unless content is sanitized and absolutely required.
 */

const UNSAFE_TAG_PATTERN =
  /<\s*(script|iframe|object|embed|link|meta|style|svg|math|form)\b/i
const EVENT_HANDLER_PATTERN = /\son[a-z]+\s*=/i
const JS_URL_PATTERN = /javascript\s*:/i
const DATA_HTML_PATTERN = /data\s*:\s*text\/html/i

/**
 * Escape HTML special characters for safe text rendering.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Detect potentially unsafe HTML/script patterns.
 * @param {unknown} value
 * @returns {boolean}
 */
export function containsUnsafeHtml(value) {
  if (typeof value !== 'string' || !value) return false
  return (
    UNSAFE_TAG_PATTERN.test(value) ||
    EVENT_HANDLER_PATTERN.test(value) ||
    JS_URL_PATTERN.test(value) ||
    DATA_HTML_PATTERN.test(value)
  )
}

/**
 * Strip tags and neutralize unsafe patterns for display-safe plain text.
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeToPlainText(value) {
  if (value === null || value === undefined) return ''
  const text = String(value)
    .replace(/<[^>]*>/g, '')
    .replace(JS_URL_PATTERN, '')
    .replace(DATA_HTML_PATTERN, '')
  return escapeHtml(text)
}

/**
 * Validate redirect paths — block open redirects.
 * Only allows relative in-app paths.
 * @param {unknown} path
 * @param {string} fallback
 * @returns {string}
 */
export function getSafeRedirectPath(path, fallback = '/') {
  if (typeof path !== 'string' || !path) return fallback
  const trimmed = path.trim()
  if (!trimmed.startsWith('/')) return fallback
  if (trimmed.startsWith('//')) return fallback
  if (trimmed.includes('://')) return fallback
  if (trimmed.toLowerCase().includes('javascript:')) return fallback
  return trimmed
}

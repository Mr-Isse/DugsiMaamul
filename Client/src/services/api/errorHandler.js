/**
 * Normalize backend API errors to a consistent client shape.
 * Follows backend responseUtils / middleware envelopes:
 * { success, message, userMessage, error: { code, message } }
 */

export function extractApiError(error) {
  if (!error) {
    return {
      status: 500,
      code: 'UNKNOWN',
      message: 'An unexpected error occurred',
      userMessage: 'Something went wrong. Please try again.',
      validationErrors: null,
      raw: null,
    }
  }

  // Network / fetch failures from RTK Query
  if (error.status === 'FETCH_ERROR' || error.name === 'FetchError') {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: error.error || 'Network Error',
      userMessage:
        'Unable to connect to the server. Please check your internet connection.',
      validationErrors: null,
      raw: error,
    }
  }

  if (error.status === 'TIMEOUT_ERROR') {
    return {
      status: 0,
      code: 'TIMEOUT',
      message: 'Request timed out',
      userMessage: 'The request took too long. Please try again.',
      validationErrors: null,
      raw: error,
    }
  }

  if (error.status === 'PARSING_ERROR') {
    return {
      status: 500,
      code: 'PARSING_ERROR',
      message: error.error || 'Invalid response',
      userMessage: 'Received an invalid response from the server.',
      validationErrors: null,
      raw: error,
    }
  }

  const status = typeof error.status === 'number' ? error.status : 500
  const data = error.data || {}

  const validationErrors =
    data.errors ||
    data.validationErrors ||
    data.error?.errors ||
    null

  const code =
    data.error?.code ||
    data.code ||
    statusToCode(status)

  const message =
    data.error?.message ||
    data.message ||
    error.error ||
    'Request failed'

  const userMessage =
    data.userMessage ||
    data.error?.userMessage ||
    defaultUserMessage(status, message)

  return {
    status,
    code,
    message,
    userMessage,
    validationErrors,
    raw: error,
  }
}

function statusToCode(status) {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 422:
      return 'VALIDATION_ERROR'
    case 423:
      return 'LOCKED'
    case 429:
      return 'TOO_MANY_REQUESTS'
    case 500:
      return 'SERVER_ERROR'
    default:
      return 'ERROR'
  }
}

function defaultUserMessage(status, fallback) {
  switch (status) {
    case 401:
      return 'Please login to access this resource.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 422:
      return 'Please check the form and correct the highlighted fields.'
    case 423:
      return 'This resource is locked. Please contact your administrator.'
    case 500:
      return 'A server error occurred. Please try again later.'
    default:
      return fallback || 'Something went wrong. Please try again.'
  }
}

export function isUnauthorized(error) {
  return extractApiError(error).status === 401
}

export function isForbidden(error) {
  return extractApiError(error).status === 403
}

export function isNotFound(error) {
  return extractApiError(error).status === 404
}

export function isLocked(error) {
  return extractApiError(error).status === 423
}

export function isValidationError(error) {
  const parsed = extractApiError(error)
  return parsed.status === 400 || parsed.status === 422 || Boolean(parsed.validationErrors)
}

export function isNetworkError(error) {
  return extractApiError(error).code === 'NETWORK_ERROR'
}

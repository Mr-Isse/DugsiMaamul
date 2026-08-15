import { STORAGE_KEYS } from '@/config/app.config'

/**
 * Secure token helpers.
 * Tokens are stored in sessionStorage by default to reduce XSS persistence risk.
 * Backend authorization remains the source of truth.
 */

const memoryStore = {
  accessToken: null,
  refreshToken: null,
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
}

export function getAccessToken() {
  if (memoryStore.accessToken) return memoryStore.accessToken
  if (!canUseStorage()) return null
  return sessionStorage.getItem(STORAGE_KEYS.accessToken)
}

export function getRefreshToken() {
  if (memoryStore.refreshToken) return memoryStore.refreshToken
  if (!canUseStorage()) return null
  return sessionStorage.getItem(STORAGE_KEYS.refreshToken)
}

export function setTokens({ accessToken, refreshToken } = {}) {
  if (accessToken) {
    memoryStore.accessToken = accessToken
    if (canUseStorage()) {
      sessionStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
    }
  }
  if (refreshToken) {
    memoryStore.refreshToken = refreshToken
    if (canUseStorage()) {
      sessionStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
    }
  }
}

export function clearTokens() {
  memoryStore.accessToken = null
  memoryStore.refreshToken = null
  if (!canUseStorage()) return
  sessionStorage.removeItem(STORAGE_KEYS.accessToken)
  sessionStorage.removeItem(STORAGE_KEYS.refreshToken)
}

export function getStoredContext() {
  if (!canUseStorage()) {
    return { tenantId: null, branchId: null, academicYearId: null }
  }
  return {
    tenantId: sessionStorage.getItem(STORAGE_KEYS.tenantId),
    branchId: sessionStorage.getItem(STORAGE_KEYS.branchId),
    academicYearId: sessionStorage.getItem(STORAGE_KEYS.academicYearId),
  }
}

export function setStoredContext({ tenantId, branchId, academicYearId } = {}) {
  if (!canUseStorage()) return
  if (tenantId !== undefined) {
    if (tenantId) sessionStorage.setItem(STORAGE_KEYS.tenantId, tenantId)
    else sessionStorage.removeItem(STORAGE_KEYS.tenantId)
  }
  if (branchId !== undefined) {
    if (branchId) sessionStorage.setItem(STORAGE_KEYS.branchId, branchId)
    else sessionStorage.removeItem(STORAGE_KEYS.branchId)
  }
  if (academicYearId !== undefined) {
    if (academicYearId) {
      sessionStorage.setItem(STORAGE_KEYS.academicYearId, academicYearId)
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.academicYearId)
    }
  }
}

export function clearStoredContext() {
  if (!canUseStorage()) return
  sessionStorage.removeItem(STORAGE_KEYS.tenantId)
  sessionStorage.removeItem(STORAGE_KEYS.branchId)
  sessionStorage.removeItem(STORAGE_KEYS.academicYearId)
}

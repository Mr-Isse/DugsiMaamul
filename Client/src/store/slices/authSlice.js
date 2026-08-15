import { createSlice } from '@reduxjs/toolkit'
import {
  clearTokens,
  getAccessToken,
  setTokens,
  clearStoredContext,
} from '@/lib/token'

const initialState = {
  user: null,
  accessToken: getAccessToken(),
  isAuthenticated: Boolean(getAccessToken()),
  permissions: [],
  roles: [],
  status: 'idle',
  error: null,
  authHydrated: false, // Tracks whether auth state has been fully hydrated after app load
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken, refreshToken, permissions, roles } =
        action.payload || {}

      if (accessToken) {
        setTokens({ accessToken, refreshToken })
        state.accessToken = accessToken
        state.isAuthenticated = true
      }

      if (user) {
        state.user = user
        state.permissions = permissions || user.permissions || []
        state.roles = roles || (user.role ? [user.role] : [])
      }

      state.error = null
      state.status = 'authenticated'
    },
    setUser(state, action) {
      state.user = action.payload
      if (action.payload?.permissions) {
        state.permissions = action.payload.permissions
      }
      if (action.payload?.role) {
        state.roles = [action.payload.role]
      }
    },
    setPermissions(state, action) {
      state.permissions = action.payload || []
    },
    setAuthError(state, action) {
      state.error = action.payload
      state.status = 'error'
    },
    logout(state) {
      clearTokens()
      clearStoredContext()
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.permissions = []
      state.roles = []
      state.status = 'idle'
      state.error = null
      state.authHydrated = false
    },
    setAuthHydrated(state, action) {
      state.authHydrated = action.payload
    },
  },
})

export const {
  setCredentials,
  setUser,
  setPermissions,
  setAuthError,
  logout,
  setAuthHydrated,
} = authSlice.actions

export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectPermissions = (state) => state.auth.permissions
export const selectRoles = (state) => state.auth.roles
export const selectSchool = (state) => state.auth.user?.school
export const selectEnabledFeatures = (state) => state.auth.user?.school?.enabledFeatures || state.auth.user?.enabledFeatures || []
export const selectAuthHydrated = (state) => state.auth.authHydrated

export default authSlice.reducer

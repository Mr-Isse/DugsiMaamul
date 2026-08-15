import { createSlice } from '@reduxjs/toolkit'

/**
 * Subscription / feature access client context.
 * Feature flags and plan details still come from the backend.
 * Frontend checks are UX-only — backend authorization is mandatory.
 */
const initialState = {
  status: null,
  plan: null,
  features: [],
  limits: {},
  warning: null,
  isRestricted: false,
  isBlocked: false,
  blockedReason: null,
  error: null,
}

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscription(state, action) {
      const payload = action.payload || {}
      state.status = payload.status ?? state.status
      state.plan = payload.plan ?? state.plan
      state.features = payload.features ?? state.features
      state.limits = payload.limits ?? state.limits
      state.warning = payload.warning ?? null
      state.isRestricted = Boolean(payload.isRestricted)
      state.isBlocked = Boolean(payload.isBlocked)
      state.blockedReason = payload.blockedReason ?? null
      state.error = null
    },
    setSubscriptionWarning(state, action) {
      state.warning = action.payload
    },
    clearSubscription(state) {
      Object.assign(state, initialState)
    },
  },
})

export const {
  setSubscription,
  setSubscriptionWarning,
  clearSubscription,
} = subscriptionSlice.actions

export const selectSubscription = (state) => state.subscription
export const selectFeatures = (state) => state.subscription.features
export const selectIsSubscriptionRestricted = (state) =>
  state.subscription.isRestricted

export default subscriptionSlice.reducer

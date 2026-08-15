import { createSlice } from '@reduxjs/toolkit'

/**
 * Client-only UI state. Server data belongs in RTK Query.
 */
const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileNavOpen: false,
  theme: 'system',
  globalLoading: false,
  pageTitle: '',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen(state, action) {
      state.sidebarOpen = Boolean(action.payload)
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = Boolean(action.payload)
    },
    setMobileNavOpen(state, action) {
      state.mobileNavOpen = Boolean(action.payload)
    },
    setThemePreference(state, action) {
      state.theme = action.payload || 'system'
    },
    setGlobalLoading(state, action) {
      state.globalLoading = Boolean(action.payload)
    },
    setPageTitle(state, action) {
      state.pageTitle = action.payload || ''
    },
  },
})

export const {
  setSidebarOpen,
  toggleSidebar,
  setSidebarCollapsed,
  setMobileNavOpen,
  setThemePreference,
  setGlobalLoading,
  setPageTitle,
} = uiSlice.actions

export const selectUi = (state) => state.ui
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectMobileNavOpen = (state) => state.ui.mobileNavOpen

export default uiSlice.reducer

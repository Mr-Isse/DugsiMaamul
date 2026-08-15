import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedTimeRange: 'monthly',
  selectedBranch: 'all',
  dashboardFilters: {
    dateRange: '30d',
    classId: null,
    subjectId: null,
  },
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload
    },
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload
    },
    setDashboardFilters: (state, action) => {
      state.dashboardFilters = { ...state.dashboardFilters, ...action.payload }
    },
    resetDashboardFilters: (state) => {
      state.dashboardFilters = initialState.dashboardFilters
    },
  },
})

export const {
  setTimeRange,
  setSelectedBranch,
  setDashboardFilters,
  resetDashboardFilters,
} = dashboardSlice.actions

export default dashboardSlice.reducer

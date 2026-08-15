import { createSlice } from '@reduxjs/toolkit'
import { getStoredContext, setStoredContext } from '@/lib/token'

const stored = getStoredContext()

const initialState = {
  tenantId: stored.tenantId,
  subdomain: null,
  school: null,
  branches: [],
  selectedBranch: localStorage.getItem('selectedBranch')
    ? JSON.parse(localStorage.getItem('selectedBranch'))
    : null,
  status: 'idle',
  error: null,
}

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenant(state, action) {
      const { tenantId, subdomain, school, branches } = action.payload || {}
      state.tenantId = tenantId ?? state.tenantId
      state.subdomain = subdomain ?? state.subdomain
      state.school = school ?? state.school
      state.branches = branches ?? state.branches
      state.status = 'ready'
      state.error = null
      setStoredContext({ tenantId: state.tenantId })
      
      // Auto-select first branch if none selected and user is branch manager
      if (!state.selectedBranch && branches && branches.length > 0) {
        const userBranch = branches.find(b => b._id === stored.branchId)
        if (userBranch) {
          state.selectedBranch = userBranch
          localStorage.setItem('selectedBranch', JSON.stringify(userBranch))
        }
      }
    },
    setSelectedBranch(state, action) {
      state.selectedBranch = action.payload
      if (action.payload) {
        localStorage.setItem('selectedBranch', JSON.stringify(action.payload))
      } else {
        localStorage.removeItem('selectedBranch')
      }
    },
    clearTenant(state) {
      state.tenantId = null
      state.subdomain = null
      state.school = null
      state.branches = []
      state.selectedBranch = null
      state.status = 'idle'
      state.error = null
      setStoredContext({ tenantId: null })
      localStorage.removeItem('selectedBranch')
    },
    setTenantError(state, action) {
      state.error = action.payload
      state.status = 'error'
    },
  },
})

export const { setTenant, clearTenant, setTenantError, setSelectedBranch } = tenantSlice.actions

export const selectTenant = (state) => state.tenant
export const selectTenantId = (state) => state.tenant.tenantId
export const selectSchool = (state) => state.tenant.school
export const selectBranches = (state) => state.tenant.branches
export const selectSelectedBranch = (state) => state.tenant.selectedBranch

export default tenantSlice.reducer

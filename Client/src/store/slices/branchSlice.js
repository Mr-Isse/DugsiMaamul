import { createSlice } from '@reduxjs/toolkit'
import { getStoredContext, setStoredContext } from '@/lib/token'

const stored = getStoredContext()

const initialState = {
  branchId: stored.branchId,
  academicYearId: stored.academicYearId,
  currentBranch: null,
  branches: [],
  status: 'idle',
  error: null,
}

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setBranch(state, action) {
      const { branchId, currentBranch } = action.payload || {}
      state.branchId = branchId ?? null
      state.currentBranch = currentBranch ?? null
      state.status = 'ready'
      setStoredContext({ branchId: state.branchId })
    },
    setAcademicYear(state, action) {
      state.academicYearId = action.payload ?? null
      setStoredContext({ academicYearId: state.academicYearId })
    },
    setBranches(state, action) {
      state.branches = action.payload || []
    },
    clearBranch(state) {
      state.branchId = null
      state.academicYearId = null
      state.currentBranch = null
      state.branches = []
      state.status = 'idle'
      state.error = null
      setStoredContext({ branchId: null, academicYearId: null })
    },
  },
})

export const { setBranch, setAcademicYear, setBranches, clearBranch } =
  branchSlice.actions

export const selectBranch = (state) => state.branch
export const selectBranchId = (state) => state.branch.branchId
export const selectAcademicYearId = (state) => state.branch.academicYearId

export default branchSlice.reducer

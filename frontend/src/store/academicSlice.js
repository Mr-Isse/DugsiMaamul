import { createSlice } from '@reduxjs/toolkit';

const academicSlice = createSlice({
  name: 'academic',
  initialState: {
    academicYears: [],
    selectedYear: localStorage.getItem('selectedYear') 
      ? JSON.parse(localStorage.getItem('selectedYear')) 
      : null,
    loading: false,
    error: null,
  },
  reducers: {
    setAcademicYears: (state, action) => {
      state.academicYears = action.payload;
      // If no year selected, try to find active one
      if (!state.selectedYear && action.payload.length > 0) {
        const active = action.payload.find(y => y.status === 'active');
        if (active) {
          state.selectedYear = active;
          localStorage.setItem('selectedYear', JSON.stringify(active));
        }
      }
    },
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
      if (action.payload) {
        localStorage.setItem('selectedYear', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('selectedYear');
      }
    },
    clearAcademicState: (state) => {
      state.academicYears = [];
      state.selectedYear = null;
      localStorage.removeItem('selectedYear');
    }
  }
});

export const { setAcademicYears, setSelectedYear, clearAcademicState } = academicSlice.actions;
export default academicSlice.reducer;

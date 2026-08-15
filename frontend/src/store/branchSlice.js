import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedBranch: localStorage.getItem('selectedBranch') 
    ? JSON.parse(localStorage.getItem('selectedBranch')) 
    : null,
};

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload;
      localStorage.setItem('selectedBranch', JSON.stringify(action.payload));
    },
    clearSelectedBranch: (state) => {
      state.selectedBranch = null;
      localStorage.removeItem('selectedBranch');
    },
  },
});

export const { setSelectedBranch, clearSelectedBranch } = branchSlice.actions;

export default branchSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedUser: null
};

export const contactSlice = createSlice({
  name: 'contactSlice',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    }
  }
});

export default contactSlice.reducer;

export const { setSelectedUser } = contactSlice.actions;

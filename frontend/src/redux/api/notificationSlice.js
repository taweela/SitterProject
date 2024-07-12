import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: []
};

export const notificationSlice = createSlice({
  name: 'notificationSlice',
  initialState,
  reducers: {
    setNotification: (state, action) => {
      state.notifications = action.payload;
    }
  }
});

export default notificationSlice.reducer;

export const { setNotification } = notificationSlice.actions;

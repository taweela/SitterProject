import { createSlice } from '@reduxjs/toolkit';
import { getUserData } from '../../utils/Utils';

const initialState = {
  user: getUserData() ? JSON.parse(getUserData()) : null
};

export const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    logout: () => initialState,
    setUser: (state, action) => {
      state.user = action.payload;
    }
  }
});

export default userSlice.reducer;

export const { logout, setUser } = userSlice.actions;

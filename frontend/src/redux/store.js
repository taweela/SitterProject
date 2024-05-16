/* eslint-disable no-undef */
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from './api/authAPI';
import { getMeAPI } from './api/getMeAPI';
import userReducer from './api/userSlice';
import { userAPI } from './api/userAPI';
import { serviceAPI } from './api/serviceAPI';

export const store = configureStore({
  reducer: {
    [authAPI.reducerPath]: authAPI.reducer,
    [getMeAPI.reducerPath]: getMeAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [serviceAPI.reducerPath]: serviceAPI.reducer,
    userState: userReducer
  },
  devTools: process.env.NODE_ENV === 'development',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({}).concat([authAPI.middleware, getMeAPI.middleware, userAPI.middleware, serviceAPI.middleware])
});

export var RootState = store.getState();
export var AppDispatch = store.dispatch;
export function useAppDispatch() {
  return useDispatch(AppDispatch);
}
export function useAppSelector(selector) {
  return useSelector(selector);
}

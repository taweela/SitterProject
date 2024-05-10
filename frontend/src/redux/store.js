/* eslint-disable no-undef */
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from './api/authAPI';

export const store = configureStore({
  reducer: {
    [authAPI.reducerPath]: authAPI.reducer
  },
  devTools: process.env.NODE_ENV === 'development',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({}).concat([authAPI.middleware])
});

export var RootState = store.getState();
export var AppDispatch = store.dispatch;
export function useAppDispatch() {
  return useDispatch(AppDispatch);
}
export function useAppSelector(selector) {
  return useSelector(selector);
}

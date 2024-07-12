/* eslint-disable no-undef */
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from './api/authAPI';
import { getMeAPI } from './api/getMeAPI';
import userReducer from './api/userSlice';
import contactReducer from './api/contactSlice';
import { userAPI } from './api/userAPI';
import { serviceAPI } from './api/serviceAPI';
import { orderAPI } from './api/orderAPI';
import { contactAPI } from './api/contactAPI';
import { paymentAPI } from './api/paymentAPI';
import { dashboardAPI } from './api/dashboardAPI';
import { reviewAPI } from './api/reviewAPI';
import { notificationAPI } from './api/notificationAPI';
import { entityAPI } from './api/entityAPI';

export const store = configureStore({
  reducer: {
    [authAPI.reducerPath]: authAPI.reducer,
    [getMeAPI.reducerPath]: getMeAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [serviceAPI.reducerPath]: serviceAPI.reducer,
    [orderAPI.reducerPath]: orderAPI.reducer,
    [contactAPI.reducerPath]: contactAPI.reducer,
    [paymentAPI.reducerPath]: paymentAPI.reducer,
    [dashboardAPI.reducerPath]: dashboardAPI.reducer,
    [reviewAPI.reducerPath]: reviewAPI.reducer,
    [notificationAPI.reducerPath]: notificationAPI.reducer,
    [entityAPI.reducerPath]: entityAPI.reducer,
    userState: userReducer,
    contactState: contactReducer
  },
  devTools: process.env.NODE_ENV === 'development',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([
      authAPI.middleware,
      getMeAPI.middleware,
      userAPI.middleware,
      serviceAPI.middleware,
      orderAPI.middleware,
      contactAPI.middleware,
      paymentAPI.middleware,
      dashboardAPI.middleware,
      reviewAPI.middleware,
      notificationAPI.middleware,
      entityAPI.middleware
    ])
});

export var RootState = store.getState();
export var AppDispatch = store.dispatch;
export function useAppDispatch() {
  return useDispatch(AppDispatch);
}
export function useAppSelector(selector) {
  return useSelector(selector);
}

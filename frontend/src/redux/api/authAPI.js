/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { setToken, setUserData } from '../../utils/Utils';
import { getMeAPI } from './getMeAPI';
// import socketIOClient from 'socket.io-client';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;
// const socket = socketIOClient(BASE_URL);
export const authAPI = createApi({
  reducerPath: 'authAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/auth/`
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query(data) {
        return {
          url: 'register',
          method: 'POST',
          body: data
        };
      }
    }),
    loginUser: builder.mutation({
      query(data) {
        return {
          url: 'login',
          method: 'POST',
          body: data,
          credentials: 'include'
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          console.log(response.data);
          //   socket.emit('login', response.data.userData._id);
          setToken(response.data.accessToken);
          setUserData(JSON.stringify(response.data.userData));
          await dispatch(getMeAPI.endpoints.getMe.initiate(null));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    adminLoginUser: builder.mutation({
      query(data) {
        return {
          url: 'admin/login',
          method: 'POST',
          body: data,
          credentials: 'include'
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          socket.emit('login', response.data.userData._id);
          setToken(response.data.accessToken);
          setUserData(JSON.stringify(response.data.userData));
          await dispatch(getMeAPI.endpoints.getMe.initiate(null));
        } catch (error) {
          console.log(error);
        }
      }
    })
  })
});

export const { useLoginUserMutation, useAdminLoginUserMutation, useRegisterUserMutation } = authAPI;

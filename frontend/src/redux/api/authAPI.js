/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { setToken, setUserData } from '../../utils/Utils';
import { getMeAPI } from './getMeAPI';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

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
          const { data } = await queryFulfilled;
          //   socket.emit('login', response.data.userData._id);
          setToken(data.accessToken);
          setUserData(JSON.stringify(data.userData));
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
          setToken(response.data.accessToken);
          setUserData(JSON.stringify(response.data.userData));
          await dispatch(getMeAPI.endpoints.getMe.initiate(null));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    forgotPassword: builder.mutation({
      query(payload) {
        return {
          url: '/forgot-password',
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      transformResponse: (result) => result
    }),
    resetPassword: builder.mutation({
      query({ token, payload }) {
        return {
          url: `/reset-password/${token}`,
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      transformResponse: (result) => result
    })
  })
});

export const { useLoginUserMutation, useAdminLoginUserMutation, useRegisterUserMutation, useForgotPasswordMutation, useResetPasswordMutation } = authAPI;

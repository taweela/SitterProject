/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, setUser } from './userSlice';
import { getToken, removeToken, removeUserData, setUserData } from '../../utils/Utils';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const getMeAPI = createApi({
  reducerPath: 'getMeAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/users`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getMe: builder.query({
      query() {
        return {
          url: '/personal/me',
          credentials: 'include'
        };
      },
      transformResponse(result) {
        return result.user;
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch (error) {
          console.log(error.error.originalStatus);
          if (error.error.originalStatus == 401) {
            removeToken();
            removeUserData();
            dispatch(logout());
          } else {
            console.log(error);
          }
        }
      }
    }),
    updateMe: builder.mutation({
      query({ id, user }) {
        return {
          url: `/update/${id}`,
          method: 'PUT',
          credentials: 'include',
          body: user
        };
      },
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
      async onQueryStarted(args, { queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          setUserData(JSON.stringify(response.data.user));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    logoutUser: builder.mutation({
      query() {
        return {
          url: 'logout',
          credentials: 'include'
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          removeToken();
          removeUserData();
          dispatch(logout());
        } catch (error) {
          console.log(error);
        }
      }
    }),
    uploadProfileAvatar: builder.mutation({
      query: (avatarFile) => {
        var formData = new FormData();
        formData.append('avatar', avatarFile);
        return {
          url: '/upload/avatar',
          method: 'PUT',
          credentials: 'include',
          body: formData
        };
      },
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
      transformResponse(result) {
        return result;
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          setUserData(JSON.stringify(response.data.updateAvatar));
          dispatch(setUser(response.data.updateAvatar));
        } catch (error) {
          console.log(error);
        }
      }
    })
  })
});

export const { useUpdateMeMutation, useLogoutUserMutation, useUploadProfileAvatarMutation } = getMeAPI;

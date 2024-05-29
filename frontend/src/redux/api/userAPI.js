/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/Utils';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const userAPI = createApi({
  reducerPath: 'userAPI',
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
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    updateUser: builder.mutation({
      query({ id, user }) {
        return {
          url: `/update/${id}`,
          method: 'PUT',
          credentials: 'include',
          body: user
        };
      },
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
      transformResponse: (result) => result.user
    }),
    getUsers: builder.query({
      query: (args) => {
        return {
          url: '/',
          params: { ...args },
          credentials: 'include'
        };
      },
      providesTags(result) {
        if (result) {
          return [
            ...result.map(({ id }) => ({
              type: 'Users',
              id
            })),
            { type: 'Users', id: 'LIST' }
          ];
        } else {
          return [{ type: 'Users', id: 'LIST' }];
        }
      },
      transformResponse(results) {
        return results.users;
      }
    }),
    getProviders: builder.query({
      query: (args) => {
        return {
          url: '/serviceProvider',
          params: { ...args },
          credentials: 'include'
        };
      },
      providesTags(result) {
        if (result && result.users) {
          return [
            ...result.users.map(({ id }) => ({
              type: 'Users',
              id
            })),
            { type: 'Users', id: 'LIST' }
          ];
        } else {
          return [{ type: 'Users', id: 'LIST' }];
        }
      },
      transformResponse(results) {
        return results;
      }
    }),
    getUser: builder.query({
      query(id) {
        return {
          url: `/getUser/${id}`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Users', id }];
      },
      transformResponse(result) {
        return result;
      }
    }),
    deleteUser: builder.mutation({
      query(id) {
        return {
          url: `/delete/${id}`,
          method: 'DELETE',
          credentials: 'include'
        };
      },
      invalidatesTags: [{ type: 'Users', id: 'LIST' }]
    })
  })
});

export const { useGetUsersQuery, useGetUserQuery, useGetProvidersQuery, useUpdateUserMutation, useDeleteUserMutation } = userAPI;

/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken, removeToken, removeUserData } from '../../utils/Utils';
import { navigate } from 'raviger';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const serviceAPI = createApi({
  reducerPath: 'serviceAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/services`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Services'],
  endpoints: (builder) => ({
    getServices: builder.query({
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
              type: 'Services',
              id
            })),
            { type: 'Services', id: 'LIST' }
          ];
        } else {
          return [{ type: 'Services', id: 'LIST' }];
        }
      },
      transformResponse(results) {
        return results.services;
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          return result;
        } catch (error) {
          if (error.error.originalStatus === 401) {
            removeToken();
            removeUserData();
            navigate('/login');
          }
        }
      }
    }),
    getClientServices: builder.query({
      query: (args) => {
        return {
          url: '/client',
          params: { ...args },
          credentials: 'include'
        };
      },
      providesTags(result) {
        if (result && result.users) {
          return [
            ...result.users.map(({ id }) => ({
              type: 'Services',
              id
            })),
            { type: 'Services', id: 'LIST' }
          ];
        } else {
          return [{ type: 'Services', id: 'LIST' }];
        }
      },
      transformResponse(results) {
        return results;
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          return result;
        } catch (error) {
          if (error.error.originalStatus === 401) {
            removeToken();
            removeUserData();
            navigate('/login');
          }
        }
      }
    }),
    getService: builder.query({
      query(id) {
        return {
          url: `/getService/${id}`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Services', id }];
      },
      transformResponse(result) {
        return result;
      }
    }),
    createService: builder.mutation({
      query(payload) {
        return {
          url: '/create',
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      invalidatesTags: [{ type: 'Services', id: 'LIST' }],
      transformResponse: (result) => result.service
    }),
    updateService: builder.mutation({
      query({ id, service }) {
        return {
          url: `/update/${id}`,
          method: 'PUT',
          credentials: 'include',
          body: service
        };
      },
      invalidatesTags: [{ type: 'Services', id: 'LIST' }],
      transformResponse: (result) => result.service
    }),
    manageStatusService: builder.mutation({
      query({ id, status }) {
        return {
          url: `/manageStatus/${id}`,
          method: 'PUT',
          credentials: 'include',
          body: status
        };
      },
      invalidatesTags: [{ type: 'Services', id: 'LIST' }],
      transformResponse: (result) => result
    }),
    deleteService: builder.mutation({
      query(id) {
        return {
          url: `/delete/${id}`,
          method: 'DELETE',
          credentials: 'include'
        };
      },
      invalidatesTags: [{ type: 'Services', id: 'LIST' }]
    }),
    manageFavouriteUser: builder.mutation({
      query({ id }) {
        return {
          url: `/favourite/${id}`,
          method: 'PUT',
          credentials: 'include',
          body: {}
        };
      },
      invalidatesTags: [{ type: 'Services', id: 'LIST' }],
      transformResponse: (result) => result
    })
  })
});

export const {
  useGetServicesQuery,
  useCreateServiceMutation,
  useGetServiceQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useManageStatusServiceMutation,
  useGetClientServicesQuery,
  useManageFavouriteUserMutation
} = serviceAPI;

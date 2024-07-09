/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/Utils';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const entityAPI = createApi({
  reducerPath: 'entityAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/entity`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Entities'],
  endpoints: (builder) => ({
    getEntities: builder.query({
      query() {
        return {
          url: `/`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Entities', id }];
      },
      transformResponse(result) {
        return result;
      }
    }),
    getProfileEntities: builder.query({
      query() {
        return {
          url: `/data`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Entities', id }];
      },
      transformResponse(result) {
        return result;
      }
    }),
    createEntity: builder.mutation({
      query(payload) {
        return {
          url: '/create',
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      invalidatesTags: [{ type: 'Entities', id: 'LIST' }],
      transformResponse: (result) => result.entity
    }),
    deleteEntity: builder.mutation({
      query({ id, bodyData }) {
        return {
          url: `/delete/${id}`,
          method: 'POST',
          credentials: 'include',
          body: bodyData
        };
      },
      invalidatesTags: [{ type: 'Entities', id: 'LIST' }]
    })
  })
});

export const { useCreateEntityMutation, useGetEntitiesQuery, useGetProfileEntitiesQuery, useDeleteEntityMutation } = entityAPI;

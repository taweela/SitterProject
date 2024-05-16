/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/Utils';

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
        console.log('----------', result);
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
      }
    })
  })
});

export const { useGetServicesQuery } = serviceAPI;

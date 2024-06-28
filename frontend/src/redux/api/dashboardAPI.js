/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/Utils';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const dashboardAPI = createApi({
  reducerPath: 'dashboardAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/dashboards`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Dashboards'],
  endpoints: (builder) => ({
    getClientDashboards: builder.query({
      query() {
        return {
          url: `/client`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Dashboards', id }];
      },
      transformResponse(result) {
        return result;
      }
    }),
    getProviderDashboards: builder.query({
      query() {
        return {
          url: `/provider`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Dashboards', id }];
      },
      transformResponse(result) {
        return result;
      }
    }),
    getDashboards: builder.query({
      query() {
        return {
          url: `/`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Dashboards', id }];
      },
      transformResponse(result) {
        return result;
      }
    })
  })
});

export const { useGetClientDashboardsQuery, useGetDashboardsQuery, useGetProviderDashboardsQuery } = dashboardAPI;

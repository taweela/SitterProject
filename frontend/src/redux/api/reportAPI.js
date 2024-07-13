/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken, removeToken, removeUserData } from '../../utils/Utils';
import { navigate } from 'raviger';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const reportAPI = createApi({
  reducerPath: 'reportAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/reports`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Reports'],
  endpoints: (builder) => ({
    getReports: builder.query({
      query() {
        return {
          url: `/`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Reports', id }];
      },
      transformResponse(result) {
        return result.reports;
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
    createReport: builder.mutation({
      query(payload) {
        return {
          url: '/create',
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      invalidatesTags: [{ type: 'Reports', id: 'LIST' }],
      transformResponse: (result) => result.report
    }),
    getReport: builder.query({
      query(id) {
        return {
          url: `/getReport/${id}`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Reports', id }];
      },
      transformResponse(result) {
        return result.report;
      }
    })
  })
});

export const { useCreateReportMutation, useGetReportsQuery, useGetReportQuery } = reportAPI;

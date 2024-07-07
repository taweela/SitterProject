/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken, removeToken, removeUserData } from '../../utils/Utils';
import { navigate } from 'raviger';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const paymentAPI = createApi({
  reducerPath: 'paymentAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/payments`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Payments'],
  endpoints: (builder) => ({
    getPayments: builder.query({
      query() {
        return {
          url: `/`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Payments', id }];
      },
      transformResponse(result) {
        return result;
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
    createPayment: builder.mutation({
      query(payload) {
        return {
          url: '/create',
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      invalidatesTags: [{ type: 'Payments', id: 'LIST' }],
      transformResponse: (result) => result.card
    })
  })
});

export const { useCreatePaymentMutation, useGetPaymentsQuery } = paymentAPI;

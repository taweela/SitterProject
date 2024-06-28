/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/Utils';

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

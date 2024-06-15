/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/Utils';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const orderAPI = createApi({
  reducerPath: 'orderAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/orders`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    getOrders: builder.query({
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
              type: 'Orders',
              id
            })),
            { type: 'Orders', id: 'LIST' }
          ];
        } else {
          return [{ type: 'Orders', id: 'LIST' }];
        }
      },
      transformResponse(results) {
        return results.orders;
      }
    }),
    getOrder: builder.query({
      query(id) {
        return {
          url: `/getOrder/${id}`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Orders', id }];
      },
      transformResponse(result) {
        return result;
      }
    }),
    createOrder: builder.mutation({
      query(payload) {
        return {
          url: '/create',
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
      transformResponse: (result) => result.order
    }),
    updateOrder: builder.mutation({
      query({ id, order }) {
        return {
          url: `/update/${id}`,
          method: 'PUT',
          credentials: 'include',
          body: order
        };
      },
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
      transformResponse: (result) => result.order
    }),
    manageStatusOrder: builder.mutation({
      query({ id, status }) {
        return {
          url: `/manageStatus/${id}`,
          method: 'PUT',
          credentials: 'include',
          body: status
        };
      },
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
      transformResponse: (result) => result
    }),
    deleteOrder: builder.mutation({
      query(id) {
        return {
          url: `/delete/${id}`,
          method: 'DELETE',
          credentials: 'include'
        };
      },
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }]
    })
  })
});

export const { useGetOrderQuery, useCreateOrderMutation, useGetOrdersQuery, useUpdateOrderMutation, useDeleteOrderMutation, useManageStatusOrderMutation } =
  orderAPI;

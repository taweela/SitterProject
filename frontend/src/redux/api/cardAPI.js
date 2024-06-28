/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/Utils';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const cardAPI = createApi({
  reducerPath: 'cardAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/cards`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Cards'],
  endpoints: (builder) => ({
    getCard: builder.query({
      query() {
        return {
          url: `/getCard`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Cards', id }];
      },
      transformResponse(result) {
        return result;
      }
    }),
    createCard: builder.mutation({
      query(payload) {
        return {
          url: '/create',
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      invalidatesTags: [{ type: 'Cards', id: 'LIST' }],
      transformResponse: (result) => result.card
    })
  })
});

export const { useCreateCardMutation, useGetCardQuery } = cardAPI;

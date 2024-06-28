/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/Utils';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const reviewAPI = createApi({
  reducerPath: 'reviewAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/reviews`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Reviews'],
  endpoints: (builder) => ({
    getReviews: builder.query({
      query(id) {
        return {
          url: `/${id}`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Reviews', id }];
      },
      transformResponse(result) {
        return result.reviews;
      }
    }),
    createReview: builder.mutation({
      query(payload) {
        return {
          url: '/create',
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      invalidatesTags: [{ type: 'Reviews', id: 'LIST' }],
      transformResponse: (result) => result.card
    })
  })
});

export const { useCreateReviewMutation, useGetReviewsQuery } = reviewAPI;

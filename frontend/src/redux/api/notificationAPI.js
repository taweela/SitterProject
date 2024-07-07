/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken, removeToken, removeUserData } from '../../utils/Utils';
import { navigate } from 'raviger';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const notificationAPI = createApi({
  reducerPath: 'notificationAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/notifications`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query() {
        return {
          url: `/`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Notifications', id }];
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
    readNotifiction: builder.mutation({
      query({ notificationId }) {
        return {
          url: `/read/${notificationId}`,
          method: 'PUT',
          credentials: 'include',
          body: {}
        };
      },
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
      transformResponse: (result) => result
    })
  })
});

export const { useReadNotifictionMutation, useGetNotificationsQuery } = notificationAPI;

/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken, removeToken, removeUserData } from '../../utils/Utils';
import { navigate } from 'raviger';

const BASE_URL = process.env.REACT_APP_SERVER_ENDPOINT;

export const contactAPI = createApi({
  reducerPath: 'contactAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/contacts`,
    prepareHeaders: (headers) => {
      const accessToken = getToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Contacts'],
  endpoints: (builder) => ({
    getContacts: builder.query({
      query() {
        return {
          url: `/`,
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Contacts', id }];
      },
      transformResponse(result) {
        return result.contacts;
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
    selectChat: builder.query({
      query: (args) => {
        return {
          url: `/selectChat`,
          params: { ...args },
          credentials: 'include'
        };
      },
      providesTags: (result, error, id) => {
        return [{ type: 'Contacts', id }];
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
    createContact: builder.mutation({
      query(payload) {
        return {
          url: '/create',
          method: 'POST',
          credentials: 'include',
          body: payload
        };
      },
      invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
      transformResponse: (result) => result
    }),
    readMessage: builder.mutation({
      query({ contactId, data }) {
        return {
          url: `/read/${contactId}`,
          method: 'PUT',
          credentials: 'include',
          body: {
            provider: data
          }
        };
      },
      invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
      transformResponse: (result) => result
    }),
    readProviderMessage: builder.mutation({
      query({ contactId, data }) {
        return {
          url: `/read/${contactId}`,
          method: 'PUT',
          credentials: 'include',
          body: {
            client: data
          }
        };
      },
      invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
      transformResponse: (result) => result
    })
  })
});

export const { useCreateContactMutation, useGetContactsQuery, useSelectChatQuery, useReadProviderMessageMutation, useReadMessageMutation } = contactAPI;

/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/Utils';

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
    })
  })
});

export const { useCreateContactMutation, useGetContactsQuery, useSelectChatQuery } = contactAPI;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
  }),
  tagTypes: ['Product', 'Category', 'Order', 'Customer', 'Discount', 'Settings', 'Report'],
  endpoints: () => ({}),
});

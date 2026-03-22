import { baseApi } from './baseApi';
import { AuthUser } from './authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<{ user: AuthUser }, void>({
      query: () => '/auth/tokenData',
      providesTags: ['Settings'],
    }),
    refreshToken: builder.mutation<void, void>({
      query: () => ({ url: '/auth/refresh-token', method: 'POST' }),
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
});

export const { useGetMeQuery, useRefreshTokenMutation, useLogoutUserMutation } = authApi;

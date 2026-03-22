import { baseApi } from './baseApi';

export interface StoreSettings {
  Id: number;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  currency: string;
  taxRate: number;
  taxEnabled: boolean;
  receiptFooter: string;
  logo: string;
  updatedAt: string;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<StoreSettings, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),

    updateSettings: builder.mutation<StoreSettings, Partial<StoreSettings>>({
      query: (body) => ({ url: '/settings', method: 'PUT', body }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;

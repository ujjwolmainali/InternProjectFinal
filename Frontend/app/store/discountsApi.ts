import { baseApi } from './baseApi';

export interface Discount {
  Id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface ValidateDiscountResponse {
  valid: boolean;
  discount: Discount;
  discountAmount: number;
}

export const discountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiscounts: builder.query<Discount[], void>({
      query: () => '/discounts',
      providesTags: ['Discount'],
    }),

    validateDiscount: builder.mutation<ValidateDiscountResponse, { code: string; orderTotal: number }>({
      query: (body) => ({ url: '/discounts/validate', method: 'POST', body }),
    }),

    createDiscount: builder.mutation<Discount, Partial<Discount>>({
      query: (body) => ({ url: '/discounts', method: 'POST', body }),
      invalidatesTags: ['Discount'],
    }),

    updateDiscount: builder.mutation<Discount, { id: number } & Partial<Discount>>({
      query: ({ id, ...body }) => ({ url: `/discounts/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Discount'],
    }),

    deleteDiscount: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/discounts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Discount'],
    }),
  }),
});

export const {
  useGetDiscountsQuery,
  useValidateDiscountMutation,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} = discountsApi;

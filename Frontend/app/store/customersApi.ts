import { baseApi } from './baseApi';

export interface Customer {
  Id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  totalSpend?: number;
  _count?: { orders: number };
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomersResponse, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 20, search = '' } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set('search', search);
        return `/customers?${params.toString()}`;
      },
      providesTags: ['Customer'],
    }),

    getCustomer: builder.query<Customer, number>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Customer', id }],
    }),

    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (body) => ({ url: '/customers', method: 'POST', body }),
      invalidatesTags: ['Customer'],
    }),

    updateCustomer: builder.mutation<Customer, { id: number } & Partial<Customer>>({
      query: ({ id, ...body }) => ({ url: `/customers/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Customer'],
    }),

    deleteCustomer: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/customers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Customer'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;

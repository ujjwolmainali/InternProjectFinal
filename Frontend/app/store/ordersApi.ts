import { baseApi } from './baseApi';

export interface OrderItem {
  Id: number;
  orderId: number;
  productId: number | null;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  Id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string;
  orderType: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  discountCode: string | null;
  total: number;
  notes: string | null;
  cashReceived: number | null;
  changeGiven: number | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: { Id: number; name: string; email: string | null; phone: string | null } | null;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateOrderPayload {
  customerName?: string;
  customerId?: number;
  orderType?: string;
  paymentMethod?: string;
  items: { productId?: number; productName: string; price: number; quantity: number }[];
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  discountCode?: string;
  total: number;
  notes?: string;
  cashReceived?: number;
  changeGiven?: number;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrdersResponse, { page?: number; limit?: number; status?: string; search?: string }>({
      query: ({ page = 1, limit = 20, status = '', search = '' } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status && status !== 'all') params.set('status', status);
        if (search) params.set('search', search);
        return `/orders?${params.toString()}`;
      },
      providesTags: ['Order'],
    }),

    getOrder: builder.query<Order, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Order', id }],
    }),

    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order', 'Product', 'Report'],
    }),

    updateOrderStatus: builder.mutation<Order, { id: number; status: string }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Order', 'Report'],
    }),

    deleteOrder: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/orders/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = ordersApi;

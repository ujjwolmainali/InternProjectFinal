import { baseApi } from './baseApi';

export interface SummaryReport {
  today: { revenue: number; orders: number };
  thisMonth: { revenue: number; orders: number; revenueGrowth: number; ordersGrowth: number };
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  tax: number;
}

export interface TopProduct {
  productName: string;
  productId: number | null;
  quantitySold: number;
  revenue: number;
  image: string;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  revenue: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

export interface InventoryReport {
  products: { Id: number; Name: string; Category: string; Quantity: number; Price: number; Status: string }[];
  outOfStock: number;
  lowStock: number;
  inStock: number;
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query<SummaryReport, void>({
      query: () => '/reports/summary',
      providesTags: ['Report'],
    }),

    getSalesReport: builder.query<SalesDataPoint[], { from?: string; to?: string; groupBy?: string }>({
      query: ({ from, to, groupBy = 'day' } = {}) => {
        const params = new URLSearchParams({ groupBy });
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        return `/reports/sales?${params.toString()}`;
      },
      providesTags: ['Report'],
    }),

    getTopProducts: builder.query<TopProduct[], { from?: string; to?: string; limit?: number }>({
      query: ({ from, to, limit = 10 } = {}) => {
        const params = new URLSearchParams({ limit: String(limit) });
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        return `/reports/products?${params.toString()}`;
      },
      providesTags: ['Report'],
    }),

    getPaymentMethods: builder.query<PaymentMethodData[], { from?: string; to?: string }>({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        return `/reports/payment-methods?${params.toString()}`;
      },
      providesTags: ['Report'],
    }),

    getMonthlyReport: builder.query<MonthlyData[], void>({
      query: () => '/reports/monthly',
      providesTags: ['Report'],
    }),

    getInventoryReport: builder.query<InventoryReport, void>({
      query: () => '/reports/inventory',
      providesTags: ['Report', 'Product'],
    }),
  }),
});

export const {
  useGetSummaryQuery,
  useGetSalesReportQuery,
  useGetTopProductsQuery,
  useGetPaymentMethodsQuery,
  useGetMonthlyReportQuery,
  useGetInventoryReportQuery,
} = reportsApi;

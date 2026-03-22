'use client';

import Link from 'next/link';
import { Users, Package, TrendingUp, DollarSign, MoreVertical, AlertTriangle, ShoppingCart } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useGetSummaryQuery, useGetMonthlyReportQuery, useGetTopProductsQuery } from '@/app/store/reportsApi';
import { useGetOrdersQuery } from '@/app/store/ordersApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetSummaryQuery();
  const { data: monthly } = useGetMonthlyReportQuery();
  const { data: topProducts } = useGetTopProductsQuery({});
  const { data: ordersData } = useGetOrdersQuery({ limit: 5 });

  const recentOrders = ordersData?.orders ?? [];

  // ── Stat Cards (real data) ───────────────────────────────────────────────────
  const statCards = [
    {
      id: '1', title: 'Today\'s Revenue',
      value: summaryLoading ? '...' : `$${(summary?.today.revenue ?? 0).toFixed(2)}`,
      sub: `${summary?.today.orders ?? 0} orders`,
      isPositive: true,
      icon: <DollarSign className="w-5 h-5" />, bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      id: '2', title: 'Month Orders',
      value: summaryLoading ? '...' : String(summary?.thisMonth.orders ?? 0),
      sub: `${summary?.thisMonth.ordersGrowth ?? 0}% vs last month`,
      isPositive: (summary?.thisMonth.ordersGrowth ?? 0) >= 0,
      icon: <Package className="w-5 h-5" />, bgColor: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      id: '3', title: 'Month Revenue',
      value: summaryLoading ? '...' : `$${(summary?.thisMonth.revenue ?? 0).toFixed(2)}`,
      sub: `${(summary?.thisMonth.revenueGrowth ?? 0).toFixed(1)}% vs last month`,
      isPositive: (summary?.thisMonth.revenueGrowth ?? 0) >= 0,
      icon: <TrendingUp className="w-5 h-5" />, bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    },
    {
      id: '4', title: 'Total Customers',
      value: summaryLoading ? '...' : String(summary?.totalCustomers ?? 0),
      sub: `${summary?.lowStockProducts ?? 0} low stock items`,
      isPositive: true,
      icon: <Users className="w-5 h-5" />, bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    },
  ];

  // ── Monthly Chart ─────────────────────────────────────────────────────────────
  const monthlyChartData = {
    labels: monthly?.map((m) => m.month.split(' ')[0]) ?? [],
    datasets: [{
      label: 'Revenue',
      data: monthly?.map((m) => m.revenue) ?? [],
      borderRadius: { topLeft: 8, topRight: 8 },
      barThickness: 14,
      backgroundColor: (ctx: any) => {
        const { ctx: c, chartArea } = ctx.chart;
        if (!chartArea) return 'rgba(99,102,241,0.8)';
        const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        g.addColorStop(0, 'rgba(99,102,241,0.4)');
        g.addColorStop(1, 'rgba(99,102,241,1)');
        return g;
      },
    }],
  };

  const monthlySalesOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111827', padding: 12, titleColor: '#F9FAFB', bodyColor: '#F9FAFB' } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(229,231,235,0.4)' }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
    },
  };

  // ── Orders + Revenue Line Chart ───────────────────────────────────────────────
  const statisticsData = {
    labels: monthly?.map((m) => m.month.split(' ')[0]) ?? [],
    datasets: [
      {
        label: 'Revenue',
        data: monthly?.map((m) => m.revenue) ?? [],
        fill: true, borderColor: '#4F46E5', borderWidth: 2, tension: 0.45, pointRadius: 0,
        backgroundColor: (ctx: any) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return 'rgba(79,70,229,0.1)';
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, 'rgba(79,70,229,0.35)');
          g.addColorStop(1, 'rgba(79,70,229,0.02)');
          return g;
        },
      },
      {
        label: 'Orders',
        data: monthly?.map((m) => m.orders) ?? [],
        fill: true, borderColor: '#10B981', borderWidth: 2, tension: 0.45, pointRadius: 0,
        backgroundColor: (ctx: any) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return 'rgba(16,185,129,0.1)';
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, 'rgba(16,185,129,0.25)');
          g.addColorStop(1, 'rgba(16,185,129,0.02)');
          return g;
        },
      },
    ],
  };

  const statisticsOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false, backgroundColor: '#111827', padding: 14, titleColor: '#F9FAFB', bodyColor: '#F9FAFB' },
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(229,231,235,0.4)' }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full lg:mt-10 lg:p-5">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="hidden sm:flex items-center justify-between lg:mt-16">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time business overview</p>
          </div>
          {summary?.lowStockProducts ? (
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-2">
              <AlertTriangle size={16} className="text-orange-500" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">{summary.lowStockProducts} low stock items</span>
            </div>
          ) : null}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((card) => (
            <div key={card.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`${card.bgColor} p-2.5 rounded-xl`}>
                  <span className="text-gray-700 dark:text-gray-200">{card.icon}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</h3>
                <span className={`text-xs font-semibold ${card.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {card.isPositive ? '↑' : '↓'} {card.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Monthly Revenue</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 12 months</p>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-60">
              {monthly && monthly.length > 0 ? (
                <Bar data={monthlyChartData} options={monthlySalesOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No data yet — complete your first order</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Revenue vs Orders</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">12-month trend</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-1 bg-indigo-500 rounded-full inline-block" /> Revenue</span>
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-1 bg-green-500 rounded-full inline-block" /> Orders</span>
              </div>
            </div>
            <div className="h-60">
              {monthly && monthly.length > 0 ? (
                <Line data={statisticsData} options={statisticsOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No data yet — complete your first order</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Recent Orders + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Recent Orders</h3>
              <Link href="/cp/pos/orders" className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
                <ShoppingCart size={13} /> View All
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="pb-3 text-xs font-semibold text-gray-500">Order</th>
                      <th className="pb-3 text-xs font-semibold text-gray-500">Customer</th>
                      <th className="pb-3 text-xs font-semibold text-gray-500">Total</th>
                      <th className="pb-3 text-xs font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.Id} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 text-xs font-semibold text-blue-600">{order.orderNumber}</td>
                        <td className="py-3 text-xs text-gray-600 dark:text-gray-400">{order.customerName}</td>
                        <td className="py-3 text-xs font-bold text-gray-900 dark:text-gray-100">${order.total.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Top Products</h3>
              <Link href="/cp/pos/reports" className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</Link>
            </div>
            {!topProducts || topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No sales yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((p, i) => (
                  <div key={p.productName} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{p.productName}</p>
                      <p className="text-xs text-gray-400">{p.quantitySold} sold</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 shrink-0">${p.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

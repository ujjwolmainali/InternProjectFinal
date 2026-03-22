'use client';

import { useState } from 'react';
import { TrendingUp, ShoppingBag, Users, DollarSign, Package, AlertTriangle, BarChart2, PieChart } from 'lucide-react';
import {
  useGetSummaryQuery,
  useGetSalesReportQuery,
  useGetTopProductsQuery,
  useGetPaymentMethodsQuery,
  useGetMonthlyReportQuery,
  useGetInventoryReportQuery,
} from '@/app/store/reportsApi';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function StatCard({ title, value, sub, icon, color }: { title: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function GrowthBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {positive ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState<'overview' | 'sales' | 'products' | 'inventory'>('overview');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const now = new Date();
  const fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const toDate = now.toISOString().split('T')[0];

  const { data: summary, isLoading: summaryLoading } = useGetSummaryQuery();
  const { data: salesData } = useGetSalesReportQuery({ from: fromDate, to: toDate, groupBy });
  const { data: topProducts } = useGetTopProductsQuery({ from: fromDate, to: toDate, limit: 8 });
  const { data: paymentMethods } = useGetPaymentMethodsQuery({ from: fromDate, to: toDate });
  const { data: monthly } = useGetMonthlyReportQuery();
  const { data: inventory } = useGetInventoryReportQuery();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={15} /> },
    { id: 'sales', label: 'Sales', icon: <TrendingUp size={15} /> },
    { id: 'products', label: 'Top Products', icon: <ShoppingBag size={15} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={15} /> },
  ] as const;

  const monthlyChartData = {
    labels: monthly?.map((m) => m.month) ?? [],
    datasets: [{
      label: 'Revenue',
      data: monthly?.map((m) => m.revenue) ?? [],
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3B82F6',
      pointRadius: 4,
    }],
  };

  const salesChartData = {
    labels: salesData?.map((d) => d.date) ?? [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: salesData?.map((d) => d.revenue) ?? [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Orders',
        data: salesData?.map((d) => d.orders) ?? [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const paymentChartData = {
    labels: paymentMethods?.map((p) => p.method) ?? [],
    datasets: [{
      data: paymentMethods?.map((p) => p.revenue) ?? [],
      backgroundColor: CHART_COLORS,
      borderWidth: 0,
    }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } } };

  return (
    <div className="p-6 mt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time business insights</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-200 h-28 animate-pulse" />)}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Today's Revenue"
            value={`$${summary.today.revenue.toFixed(2)}`}
            sub={`${summary.today.orders} orders today`}
            icon={<DollarSign size={20} className="text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Month Revenue"
            value={`$${summary.thisMonth.revenue.toFixed(2)}`}
            sub={`${summary.thisMonth.orders} orders`}
            icon={<TrendingUp size={20} className="text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            title="Customers"
            value={String(summary.totalCustomers)}
            sub="Total registered"
            icon={<Users size={20} className="text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            title="Low Stock"
            value={String(summary.lowStockProducts)}
            sub={`of ${summary.totalProducts} products`}
            icon={<AlertTriangle size={20} className="text-orange-600" />}
            color="bg-orange-50"
          />
        </div>
      )}

      {/* Growth Badges */}
      {summary && (
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2">
            <span className="text-sm text-gray-600">Revenue growth</span>
            <GrowthBadge value={summary.thisMonth.revenueGrowth} />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2">
            <span className="text-sm text-gray-600">Orders growth</span>
            <GrowthBadge value={summary.thisMonth.ordersGrowth} />
          </div>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-2 mb-6 bg-white border border-gray-200 rounded-2xl p-1.5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Monthly Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Revenue — Last 12 Months</h3>
            <div className="h-64">
              {monthly && monthly.length > 0 ? (
                <Line data={monthlyChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
              )}
            </div>
          </div>

          {/* Payment Methods Doughnut */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><PieChart size={16} /> Payment Methods</h3>
            <div className="h-48">
              {paymentMethods && paymentMethods.length > 0 ? (
                <Doughnut data={paymentChartData} options={{ ...chartOptions, plugins: { legend: { position: 'bottom' as const } } }} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
              )}
            </div>
            {paymentMethods && (
              <div className="mt-3 space-y-2">
                {paymentMethods.map((p, i) => (
                  <div key={p.method} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                      <span className="text-gray-600">{p.method}</span>
                    </div>
                    <span className="font-semibold text-gray-800">${p.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sales Tab ── */}
      {tab === 'sales' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Sales This Month</h3>
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((g) => (
                <button key={g} onClick={() => setGroupBy(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${groupBy === g ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            {salesData && salesData.length > 0 ? (
              <Bar data={salesChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No sales data for this period</div>
            )}
          </div>
          {salesData && salesData.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-500">Total Revenue</p>
                <p className="font-bold text-blue-800">${salesData.reduce((s, d) => s + d.revenue, 0).toFixed(2)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-green-500">Total Orders</p>
                <p className="font-bold text-green-800">{salesData.reduce((s, d) => s + d.orders, 0)}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xs text-orange-500">Avg Order Value</p>
                <p className="font-bold text-orange-800">
                  ${(salesData.reduce((s, d) => s + d.revenue, 0) / Math.max(salesData.reduce((s, d) => s + d.orders, 0), 1)).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Top Products Tab ── */}
      {tab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Top Selling Products — This Month</h3>
          </div>
          {!topProducts || topProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No product data yet</p>
              <p className="text-sm">Complete some orders to see analytics</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {topProducts.map((p, i) => (
                <div key={p.productName} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'
                  }`}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{p.productName}</p>
                    <p className="text-xs text-gray-400">{p.quantitySold} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">${p.revenue.toFixed(2)}</p>
                    <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (p.revenue / (topProducts[0]?.revenue || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Inventory Tab ── */}
      {tab === 'inventory' && (
        <div className="space-y-5">
          {inventory && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                <p className="text-xs text-green-500 font-medium">In Stock</p>
                <p className="text-3xl font-bold text-green-700">{inventory.inStock}</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
                <p className="text-xs text-orange-500 font-medium">Low Stock (≤10)</p>
                <p className="text-3xl font-bold text-orange-700">{inventory.lowStock}</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                <p className="text-xs text-red-500 font-medium">Out of Stock</p>
                <p className="text-3xl font-bold text-red-700">{inventory.outOfStock}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Stock Levels</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product', 'Category', 'Stock', 'Price', 'Status', 'Level'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventory?.products.map((p) => (
                    <tr key={p.Id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">{p.Name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.Category}</td>
                      <td className="px-4 py-3 font-bold text-sm">{p.Quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">${p.Price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.Quantity === 0 ? 'bg-red-100 text-red-700' :
                          p.Quantity <= 10 ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {p.Quantity === 0 ? 'Out of stock' : p.Quantity <= 10 ? 'Low stock' : 'In stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${p.Quantity === 0 ? 'bg-red-400' : p.Quantity <= 10 ? 'bg-orange-400' : 'bg-green-400'}`}
                            style={{ width: `${Math.min(100, (p.Quantity / 100) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Users, Package, TrendingUp, DollarSign, MoreVertical, BarChart } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';


import { Bar, Line } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  bgColor: string;
}

export default function Home() {
 

  const statCards: StatCard[] = [
    {
      id: '1',
      title: 'Customers',
      value: '3,782',
      change: '11.01%',
      isPositive: true,
      icon: <Users className="w-5 h-5" />,
      bgColor: 'bg-black-50'
    },
    {
      id: '2',
      title: 'Orders',
      value: '5,359',
      change: '9.05%',
      isPositive: false,
      icon: <Package className="w-5 h-5" />,
      bgColor: 'bg-black-50 '
    },
    {
      id: '3',
      title: 'Revenue',
      value: '$45,280',
      change: '18.2%',
      isPositive: true,
      icon: <DollarSign className="w-5 h-5" />,
      bgColor: 'bg-black-50 '
    },
    {
      id: '4',
      title: 'Growth',
      value: '24.5%',
      change: '4.3%',
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5" />,
      bgColor: 'bg-black-50'
    }
  ];

  // Monthly Sales Bar Chart Data
  const monthlySalesData = {
  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  datasets: [
    {
      label: 'Sales',
      data: [150, 380, 220, 320, 180, 220, 300, 180, 280, 420, 350, 280],
      borderRadius: { topLeft: 8, topRight: 8 },
      barThickness: 14,
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart;
        const { ctx: canvasCtx, chartArea } = chart;
        if (!chartArea) return;

        const gradient = canvasCtx.createLinearGradient(
          0,
          chartArea.bottom,
          0,
          chartArea.top
        );
        gradient.addColorStop(0, 'rgba(99,102,241,0.4)');
        gradient.addColorStop(1, 'rgba(99,102,241,1)');
        return gradient;
      },
    },
  ],
};


const monthlySalesOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#111827',
      padding: 12,
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      borderColor: '#374151',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9CA3AF', font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(229,231,235,0.4)',
        drawBorder: false,
      },
      ticks: {
        color: '#9CA3AF',
        stepSize: 100,
        font: { size: 11 },
      },
    },
  },
};


  // Statistics Area Chart Data
const statisticsData = {
  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  datasets: [
    {
      label: 'Revenue',
      data: [180,190,170,160,175,165,170,205,230,210,240,235],
      fill: true,
      borderColor: '#4F46E5',
      borderWidth: 2,
      tension: 0.45,
      pointRadius: 0,
      backgroundColor: (ctx: any) => {
        const { ctx: c, chartArea } = ctx.chart;
        if (!chartArea) return;
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, 'rgba(79,70,229,0.35)');
        g.addColorStop(1, 'rgba(79,70,229,0.02)');
        return g;
      },
    },
    {
      label: 'Sales',
      data: [40,30,50,40,55,40,65,100,110,120,150,140],
      fill: true,
      borderColor: 'green',
      borderWidth: 2,
      tension: 0.45,
      pointRadius: 0,
      backgroundColor: (ctx: any) => {
        const { ctx: c, chartArea } = ctx.chart;
        if (!chartArea) return;
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, 'rgba(147,197,253,0.3)');
        g.addColorStop(1, 'rgba(147,197,253,0.02)');
        return g;
      },
    },
  ],
};

const statisticsOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: '#111827',
      padding: 14,
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      borderColor: '#374151',
      borderWidth: 1,
      bodySpacing: 6,        // space between each line in the tooltip
      titleSpacing: 8,       // space between title and body
      titleMarginBottom: 6,  // extra margin under title
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9CA3AF', font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(229,231,235,0.4)',
        drawBorder: false,
      },
      ticks: {
        color: '#9CA3AF',
        stepSize: 50,
        font: { size: 11 },
      },
    },
  },
};



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full lg:mt-10 lg:p-5 ">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Page Header - Hidden on mobile, visible on larger screens */}
        <div className="hidden sm:block">
          <h1 className="text-2xl  lg:text-3xl lg:mt-16 font-bold text-gray-900 dark:text-gray-100">E-Commerce Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 lg:mt-5">Welcome back, here's your overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {statCards.map((card) => (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`${card.bgColor} p-2.5 sm:p-3 rounded-lg`}>
                  <span className="text-gray-700 dark:text-gray-200">{card.icon}</span>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value}</h3>
                  <span
                    className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${
                      card.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {card.isPositive ? '↑' : '↓'} {card.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Monthly Sales Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Monthly Sales</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">Sales performance overview</p>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-300" />
              </button>
            </div>
            <div className="h-64 sm:h-72 lg:w-full ">
              <Bar data={monthlySalesData} options={monthlySalesOptions} />
            </div>
          </div>

          {/* Statistics Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Statistics</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">Target you've set for each month</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto">
                <button className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap">
                  Overview
                </button>
                <button className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors whitespace-nowrap">
                  Sales
                </button>
                <button className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors whitespace-nowrap">
                  Revenue
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-300" />
                </button>
              </div>
            </div>
            <div className="h-64 sm:h-72 lg:h-80">
              <Line data={statisticsData} options={statisticsOptions} />
            </div>
          </div>
        </div>

        {/* Recent Activity or Additional Content Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Recent Orders</h3>
            <button className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                  <th className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                  <th className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { product: 'Macbook Pro 13"', category: 'Laptop', price: '$2,399', status: 'Delivered', statusColor: 'green' },
                  { product: 'Apple Watch Ultra', category: 'Watch', price: '$879', status: 'Pending', statusColor: 'yellow' },
                  { product: 'iPhone 15 Pro', category: 'Phone', price: '$1,869', status: 'Delivered', statusColor: 'green' },
                  { product: 'iPad Pro', category: 'Tablet', price: '$1,699', status: 'Canceled', statusColor: 'red' }
                ].map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{order.product}</td>
                    <td className="px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{order.category}</td>
                    <td className="px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{order.price}</td>
                    <td className="px-4 py-3 sm:py-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                        ${order.statusColor === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          order.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, Filter, X, Printer, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetOrdersQuery, useUpdateOrderStatusMutation, useDeleteOrderMutation, Order } from '@/app/store/ordersApi';
import { useGetSettingsQuery } from '@/app/store/settingsApi';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  Cash: 'bg-blue-50 text-blue-700',
  Card: 'bg-indigo-50 text-indigo-700',
  QR: 'bg-teal-50 text-teal-700',
};

function OrderDetailModal({ order, onClose, storeName, receiptFooter }: {
  order: Order; onClose: () => void; storeName: string; receiptFooter: string;
}) {
  const [updateStatus] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus({ id: order.Id, status }).unwrap();
      toast.success(`Order ${status}`);
      onClose();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) return;
    const items = order.items.map((i) =>
      `<div class="row"><span>${i.productName} x${i.quantity}</span><span>$${i.subtotal.toFixed(2)}</span></div>`
    ).join('');
    w.document.write(`<html><head><title>Receipt</title><style>
      body{font-family:monospace;font-size:12px;padding:16px;width:300px}
      h2,p{text-align:center;margin:2px 0}hr{border-top:1px dashed #000;margin:8px 0}
      .row{display:flex;justify-content:space-between;margin:2px 0}.bold{font-weight:bold}
    </style></head><body>
      <h2>${storeName}</h2>
      <p>${new Date(order.createdAt).toLocaleString()}</p>
      <hr/><div class="row bold"><span>Order</span><span>${order.orderNumber}</span></div>
      <div class="row"><span>Customer</span><span>${order.customerName}</span></div>
      <div class="row"><span>Payment</span><span>${order.paymentMethod}</span></div>
      <hr/>${items}<hr/>
      <div class="row"><span>Subtotal</span><span>$${order.subtotal.toFixed(2)}</span></div>
      ${order.discountAmount > 0 ? `<div class="row" style="color:green"><span>Discount</span><span>-$${order.discountAmount.toFixed(2)}</span></div>` : ''}
      <div class="row"><span>Tax</span><span>$${order.taxAmount.toFixed(2)}</span></div>
      <div class="row bold"><span>Total</span><span>$${order.total.toFixed(2)}</span></div>
      <hr/><p>${receiptFooter}</p>
      <script>window.onload=()=>{window.print();window.close()}<\/script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{order.orderNumber}</h3>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <Printer size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Customer', value: order.customerName },
              { label: 'Type', value: order.orderType },
              { label: 'Payment', value: order.paymentMethod },
              { label: 'Status', value: order.status },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-800 capitalize text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Items</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.Id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-500">${item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
                <span>-${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600"><span>Tax</span><span>${order.taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
            {order.cashReceived && (
              <>
                <div className="flex justify-between text-sm text-gray-600"><span>Cash Received</span><span>${Number(order.cashReceived).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>Change</span><span>${Number(order.changeGiven).toFixed(2)}</span></div>
              </>
            )}
          </div>

          {order.notes && (
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-xs text-yellow-700 font-medium mb-1">Notes</p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        {order.status === 'completed' && (
          <div className="p-4 border-t flex gap-2">
            <button onClick={() => handleStatusChange('cancelled')} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 border border-red-200">
              Cancel Order
            </button>
            <button onClick={() => handleStatusChange('refunded')} className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-xl text-sm font-semibold hover:bg-purple-100 border border-purple-200">
              Refund
            </button>
          </div>
        )}
        {order.status === 'pending' && (
          <div className="p-4 border-t">
            <button onClick={() => handleStatusChange('completed')} className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
              Mark as Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading, refetch } = useGetOrdersQuery({ page, limit: 15, status: statusFilter, search });
  const { data: settings } = useGetSettingsQuery();
  const [deleteOrder] = useDeleteOrderMutation();

  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this order?')) return;
    try {
      await deleteOrder(id).unwrap();
      toast.success('Order deleted');
    } catch {
      toast.error('Failed to delete order');
    }
  };

  return (
    <div className="p-6 mt-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.total ?? 0} total orders</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg font-medium mb-1">No orders found</p>
            <p className="text-sm">Orders will appear here after checkout</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Order #', 'Customer', 'Type', 'Items', 'Payment', 'Total', 'Status', 'Date', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-blue-600 text-sm whitespace-nowrap">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{order.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{order.orderType}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{order.items?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${PAYMENT_COLORS[order.paymentMethod] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-sm">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleDelete(order.Id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft size={15} /> Prev
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          storeName={settings?.storeName ?? 'Store'}
          receiptFooter={settings?.receiptFooter ?? 'Thank you!'}
        />
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  User, Mail, Phone, MapPin, ShoppingBag, DollarSign, Package,
  Calendar, Receipt,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  Customer,
} from '@/app/store/customersApi';

// ─── Customer Form Modal ──────────────────────────────────────────────────────
function CustomerModal({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  const isEdit = !!customer;
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? '',
    notes: customer?.notes ?? '',
  });

  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();
  const loading = creating || updating;

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (isEdit && customer) {
        await updateCustomer({ id: customer.Id, ...form }).unwrap();
        toast.success('Customer updated');
      } else {
        await createCustomer(form).unwrap();
        toast.success('Customer created');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Operation failed');
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name *', placeholder: 'John Doe', icon: <User size={15} />, type: 'text' },
    { key: 'email', label: 'Email', placeholder: 'john@example.com', icon: <Mail size={15} />, type: 'email' },
    { key: 'phone', label: 'Phone', placeholder: '+1 234 567 8900', icon: <Phone size={15} />, type: 'tel' },
    { key: 'address', label: 'Address', placeholder: '123 Main St, City', icon: <MapPin size={15} />, type: 'text' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{isEdit ? 'Edit Customer' : 'New Customer'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {fields.map(({ key, label, placeholder, icon, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Customer Detail Panel ────────────────────────────────────────────────────
function CustomerDetailPanel({ customerId, onClose, onEdit, onDelete }: {
  customerId: number; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  // Fetch full customer with complete order + item data
  const { data: customer, isLoading } = useGetCustomerQuery(customerId);
  const orders: any[] = (customer as any)?.orders ?? [];

  const totalSpend = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            {customer && (
              <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
                {customer?.name ?? '...'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Customer Profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50"
            >
              Delete
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-5 space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3.5">
                <p className="text-xs text-blue-500 dark:text-blue-400 mb-1 flex items-center gap-1">
                  <ShoppingBag size={12} /> Total Orders
                </p>
                <p className="font-bold text-blue-800 dark:text-blue-300 text-2xl">{orders.length}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3.5">
                <p className="text-xs text-green-500 dark:text-green-400 mb-1 flex items-center gap-1">
                  <DollarSign size={12} /> Total Spent
                </p>
                <p className="font-bold text-green-800 dark:text-green-300 text-2xl">${totalSpend.toFixed(2)}</p>
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
              {customer?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail size={14} className="text-gray-400 dark:text-gray-500 shrink-0" /> {customer.email}
                </div>
              )}
              {customer?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone size={14} className="text-gray-400 dark:text-gray-500 shrink-0" /> {customer.phone}
                </div>
              )}
              {customer?.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin size={14} className="text-gray-400 dark:text-gray-500 shrink-0" /> {customer.address}
                </div>
              )}
              {customer?.notes && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic border-t border-gray-200 dark:border-gray-600 pt-2">
                  "{customer.notes}"
                </div>
              )}
            </div>

            {/* Order history */}
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
                <Receipt size={15} className="text-gray-500" /> Purchase History
              </h4>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((o: any) => {
                    const isExpanded = expandedOrder === o.Id;
                    return (
                      <div key={o.Id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        {/* Order row */}
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : o.Id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Receipt size={14} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{o.orderNumber}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <Calendar size={10} />
                                {new Date(o.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                {' · '}{o.paymentMethod}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-sm text-gray-900 dark:text-gray-100">${o.total.toFixed(2)}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${
                                o.status === 'completed' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                                o.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                                'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                              }`}>{o.status}</span>
                            </div>
                            <ChevronRight size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </button>

                        {/* Items breakdown */}
                        {isExpanded && o.items?.length > 0 && (
                          <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 px-3 py-2 space-y-1.5">
                            {o.items.map((item: any) => (
                              <div key={item.Id} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                  <Package size={11} className="text-gray-400 shrink-0" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300">{item.productName}</span>
                                  <span className="text-gray-400">×{item.quantity}</span>
                                </div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">${item.subtotal.toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-1.5 flex justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                              <span>Order Total</span>
                              <span>${o.total.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomerId, setViewingCustomerId] = useState<number | null>(null);

  const { data, isLoading } = useGetCustomersQuery({ page, limit: 15, search });
  const [deleteCustomer] = useDeleteCustomerMutation();

  const customers = data?.customers ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete customer "${name}"?`)) return;
    try {
      await deleteCustomer(id).unwrap();
      toast.success('Customer deleted');
      if (viewingCustomerId === id) setViewingCustomerId(null);
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  const openCreate = () => { setEditingCustomer(null); setShowModal(true); };
  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setViewingCustomerId(null);
    setShowModal(true);
  };

  return (
    <div className="p-6 mt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{data?.total ?? 0} total customers</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow-sm"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 h-40 animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <User size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium mb-1">No customers found</p>
          <p className="text-sm mb-4">Add your first customer to get started</p>
          <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
            Add Customer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {customers.map((customer) => (
            <div key={customer.Id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:hover:shadow-gray-900/40 transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{customer.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{customer.email || 'No email'}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(customer)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 rounded-lg">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(customer.Id, customer.name)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Phone size={12} className="text-gray-400 shrink-0" /> {customer.phone}
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <span className="line-clamp-1">{customer.address}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Orders</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{customer._count?.orders ?? 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Spent</p>
                  <p className="font-bold text-green-600 dark:text-green-400">${(customer.totalSpend ?? 0).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setViewingCustomerId(customer.Id)}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => { setShowModal(false); setEditingCustomer(null); }}
        />
      )}
      {viewingCustomerId !== null && !showModal && (
        <CustomerDetailPanel
          customerId={viewingCustomerId}
          onClose={() => setViewingCustomerId(null)}
          onEdit={() => {
            const c = customers.find((x) => x.Id === viewingCustomerId) ?? null;
            if (c) openEdit(c);
          }}
          onDelete={() => {
            const c = customers.find((x) => x.Id === viewingCustomerId);
            if (c) handleDelete(c.Id, c.name);
          }}
        />
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Tag, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  Discount,
} from '@/app/store/discountsApi';

// ─── Discount Form Modal ──────────────────────────────────────────────────────
function DiscountModal({ discount, onClose }: { discount: Discount | null; onClose: () => void }) {
  const isEdit = !!discount;
  const [form, setForm] = useState({
    code: discount?.code ?? '',
    type: discount?.type ?? 'percentage',
    value: discount ? String(discount.value) : '',
    minOrder: discount?.minOrder ? String(discount.minOrder) : '',
    maxUses: discount?.maxUses ? String(discount.maxUses) : '',
    isActive: discount?.isActive ?? true,
    expiresAt: discount?.expiresAt ? discount.expiresAt.split('T')[0] : '',
  });

  const [createDiscount, { isLoading: creating }] = useCreateDiscountMutation();
  const [updateDiscount, { isLoading: updating }] = useUpdateDiscountMutation();
  const loading = creating || updating;

  const set = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    if (!form.value || isNaN(Number(form.value))) { toast.error('Valid value is required'); return; }

    const payload = {
      code: form.code.toUpperCase(),
      type: form.type as 'percentage' | 'fixed',
      value: Number(form.value),
      minOrder: form.minOrder ? Number(form.minOrder) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      isActive: form.isActive,
      expiresAt: form.expiresAt || null,
    };

    try {
      if (isEdit && discount) {
        await updateDiscount({ id: discount.Id, ...payload }).unwrap();
        toast.success('Discount updated');
      } else {
        await createDiscount(payload).unwrap();
        toast.success('Discount created');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Operation failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit Discount' : 'New Discount'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Coupon Code *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              placeholder="SUMMER20"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Value {form.type === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => set('value', e.target.value)}
                placeholder={form.type === 'percentage' ? '20' : '10.00'}
                min={0}
                max={form.type === 'percentage' ? 100 : undefined}
                step={form.type === 'percentage' ? 1 : 0.01}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Min Order + Max Uses */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Order ($)</label>
              <input
                type="number"
                value={form.minOrder}
                onChange={(e) => set('minOrder', e.target.value)}
                placeholder="Optional"
                min={0}
                step={0.01}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => set('maxUses', e.target.value)}
                placeholder="Unlimited"
                min={1}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => set('expiresAt', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Active</span>
            <button type="button" onClick={() => set('isActive', !form.isActive)} className="text-blue-600">
              {form.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-400" />}
            </button>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiscountsPage() {
  const { data: discounts = [], isLoading } = useGetDiscountsQuery();
  const [updateDiscount] = useUpdateDiscountMutation();
  const [deleteDiscount] = useDeleteDiscountMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteDiscount(id).unwrap();
      toast.success('Discount deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleActive = async (d: Discount) => {
    try {
      await updateDiscount({ id: d.Id, isActive: !d.isActive }).unwrap();
      toast.success(d.isActive ? 'Discount deactivated' : 'Discount activated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const openCreate = () => { setEditingDiscount(null); setShowModal(true); };
  const openEdit = (d: Discount) => { setEditingDiscount(d); setShowModal(true); };

  return (
    <div className="p-6 mt-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discounts & Coupons</h1>
          <p className="text-gray-500 text-sm mt-0.5">{discounts.length} coupons</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow-sm">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-200 h-40 animate-pulse" />)}
        </div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Tag size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium mb-1">No coupons yet</p>
          <p className="text-sm mb-4">Create your first discount coupon</p>
          <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discounts.map((d) => {
            const isExpired = d.expiresAt ? new Date(d.expiresAt) < new Date() : false;
            const isMaxed = d.maxUses !== null && d.usedCount >= d.maxUses;
            const effective = d.isActive && !isExpired && !isMaxed;

            return (
              <div key={d.Id} className={`bg-white rounded-2xl border-2 p-5 transition-all ${effective ? 'border-blue-200' : 'border-gray-100 opacity-70'}`}>
                {/* Top Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${effective ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <Tag size={18} className={effective ? 'text-blue-600' : 'text-gray-400'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base font-mono tracking-wider">{d.code}</span>
                        <button onClick={() => copyCode(d.code)} className="text-gray-400 hover:text-gray-600">
                          {copiedCode === d.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        effective ? 'bg-green-100 text-green-700' : isExpired ? 'bg-red-100 text-red-700' : isMaxed ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {effective ? 'Active' : isExpired ? 'Expired' : isMaxed ? 'Max uses reached' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(d.Id, d.code)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>

                {/* Discount Value */}
                <div className="mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {d.type === 'percentage' ? `${d.value}%` : `$${d.value.toFixed(2)}`}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">off</span>
                  {d.type === 'percentage' && <span className="text-xs text-gray-400 ml-1">({d.type})</span>}
                </div>

                {/* Details */}
                <div className="space-y-1 mb-4">
                  {d.minOrder && <p className="text-xs text-gray-500">Min. order: <span className="font-medium text-gray-700">${d.minOrder.toFixed(2)}</span></p>}
                  <p className="text-xs text-gray-500">
                    Used: <span className="font-medium text-gray-700">{d.usedCount}</span>
                    {d.maxUses && <> / {d.maxUses}</>}
                  </p>
                  {d.expiresAt && (
                    <p className="text-xs text-gray-500">
                      Expires: <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                        {new Date(d.expiresAt).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggleActive(d)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    d.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {d.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {d.isActive ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <DiscountModal
          discount={editingDiscount}
          onClose={() => { setShowModal(false); setEditingDiscount(null); }}
        />
      )}
    </div>
  );
}

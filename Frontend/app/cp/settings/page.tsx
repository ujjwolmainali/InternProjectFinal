'use client';

import { useState, useEffect } from 'react';
import { Store, Phone, Mail, MapPin, DollarSign, Percent, FileText, Save, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetSettingsQuery, useUpdateSettingsMutation, StoreSettings } from '@/app/store/settingsApi';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY', 'SGD', 'AED', 'NPR'];

export default function SettingsPage() {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<Partial<StoreSettings>>({
    storeName: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    currency: 'USD',
    taxRate: 8,
    taxEnabled: true,
    receiptFooter: 'Thank you for your purchase!',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        storeName: settings.storeName,
        storeAddress: settings.storeAddress,
        storePhone: settings.storePhone,
        storeEmail: settings.storeEmail,
        currency: settings.currency,
        taxRate: settings.taxRate,
        taxEnabled: settings.taxEnabled,
        receiptFooter: settings.receiptFooter,
      });
    }
  }, [settings]);

  const set = (field: keyof StoreSettings, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(form).unwrap();
      setSaved(true);
      toast.success('Settings saved successfully');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 mt-20">
        <div className="max-w-2xl mx-auto space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-200 h-32 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configure your POS system settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Store Information ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store size={18} className="text-blue-500" /> Store Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Store Name</label>
                <input
                  type="text"
                  value={form.storeName ?? ''}
                  onChange={(e) => set('storeName', e.target.value)}
                  placeholder="My Awesome Store"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Address
                </label>
                <input
                  type="text"
                  value={form.storeAddress ?? ''}
                  onChange={(e) => set('storeAddress', e.target.value)}
                  placeholder="123 Main Street, City, Country"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <Phone size={12} /> Phone
                  </label>
                  <input
                    type="tel"
                    value={form.storePhone ?? ''}
                    onChange={(e) => set('storePhone', e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <Mail size={12} /> Email
                  </label>
                  <input
                    type="email"
                    value={form.storeEmail ?? ''}
                    onChange={(e) => set('storeEmail', e.target.value)}
                    placeholder="store@example.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Payment & Tax ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-green-500" /> Payment & Tax
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                <select
                  value={form.currency ?? 'USD'}
                  onChange={(e) => set('currency', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Tax Toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Enable Tax</p>
                  <p className="text-xs text-gray-400">Apply tax to all orders</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('taxEnabled', !form.taxEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.taxEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.taxEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {form.taxEnabled && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <Percent size={12} /> Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={form.taxRate ?? 8}
                    onChange={(e) => set('taxRate', Number(e.target.value))}
                    min={0}
                    max={100}
                    step={0.1}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Example: on a $100 order, tax will be ${(((form.taxRate ?? 8) / 100) * 100).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Receipt Settings ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-purple-500" /> Receipt Settings
            </h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Receipt Footer Message</label>
              <textarea
                value={form.receiptFooter ?? ''}
                onChange={(e) => set('receiptFooter', e.target.value)}
                placeholder="Thank you for your purchase!"
                rows={3}
                maxLength={200}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{(form.receiptFooter ?? '').length}/200 characters</p>
            </div>

            {/* Receipt Preview */}
            <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Receipt Preview</p>
              <div className="font-mono text-xs text-gray-700 space-y-1 text-center">
                <p className="font-bold text-base">{form.storeName || 'Store Name'}</p>
                {form.storeAddress && <p className="text-gray-500 text-xs">{form.storeAddress}</p>}
                {form.storePhone && <p className="text-gray-500 text-xs">{form.storePhone}</p>}
                <div className="border-t border-dashed border-gray-300 my-2" />
                <div className="text-left">
                  <div className="flex justify-between"><span>Item × 1</span><span>$10.00</span></div>
                  <div className="border-t border-dashed border-gray-300 my-1" />
                  {form.taxEnabled && <div className="flex justify-between text-gray-500"><span>Tax ({form.taxRate}%)</span><span>${((form.taxRate ?? 8) / 10).toFixed(2)}</span></div>}
                  <div className="flex justify-between font-bold"><span>Total</span><span>${(10 + (form.taxEnabled ? (form.taxRate ?? 8) / 10 : 0)).toFixed(2)}</span></div>
                </div>
                <div className="border-t border-dashed border-gray-300 my-2" />
                <p className="text-gray-500">{form.receiptFooter || 'Thank you!'}</p>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {saving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</>
            ) : saved ? (
              <><CheckCircle size={18} /> Saved!</>
            ) : (
              <><Save size={18} /> Save Settings</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

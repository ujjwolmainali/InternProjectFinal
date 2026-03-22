'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, X, Minus, Plus, ShoppingCart, CreditCard, Smartphone, QrCode,
  Trash2, Check, CheckCircle, XCircle, Printer, Tag, ChevronDown,
  RefreshCw, Clock, CheckSquare, AlertCircle, Ban,
  User, Mail, Phone, MapPin, DollarSign, ShoppingBag, Receipt, Package, Calendar,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetOrdersQuery, useCreateOrderMutation } from '@/app/store/ordersApi';
import { useValidateDiscountMutation } from '@/app/store/discountsApi';
import { useGetSettingsQuery } from '@/app/store/settingsApi';
import { useGetCustomersQuery, useGetCustomerQuery } from '@/app/store/customersApi';

// ─── Re-use product types from existing API shape ────────────────────────────
interface ProductImage { Id: number; productId: number; imageUrl: string }
interface ProductColor { Id: number; productId: number; color: string; images: { Id: number; colorId: number; imageUrl: string }[] }
interface Product {
  Id: number; Name: string; Category: string; Price: number; SalePrice: number | null;
  Quantity: number; Description: string; Status: string; IsFeatured: boolean;
  images: ProductImage[]; colors: ProductColor[];
}

interface CartItem {
  productId: number; productName: string; Category: string;
  price: number; image: string; stock: number; quantity: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ─── Receipt Component ────────────────────────────────────────────────────────
function ReceiptModal({ order, storeName, receiptFooter, onClose }: {
  order: any; storeName: string; receiptFooter: string; onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML || '';
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) return;
    w.document.write(`<html><head><title>Receipt</title><style>
      body{font-family:monospace;font-size:12px;padding:16px;width:300px}
      h2{text-align:center;margin:0 0 4px}p{text-align:center;margin:2px 0}
      hr{border-top:1px dashed #000;margin:8px 0}
      .row{display:flex;justify-content:space-between}
      .bold{font-weight:bold}.center{text-align:center}
    </style></head><body>${content}<script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-gray-800">Receipt</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div ref={printRef} className="font-mono text-xs">
            <h2 className="text-center font-bold text-base mb-1">{storeName}</h2>
            <p className="text-center text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
            <hr className="border-dashed my-2" />
            <div className="flex justify-between font-bold text-xs"><span>Order</span><span>{order.orderNumber}</span></div>
            <div className="flex justify-between text-xs"><span>Customer</span><span>{order.customerName}</span></div>
            <div className="flex justify-between text-xs"><span>Payment</span><span>{order.paymentMethod}</span></div>
            <hr className="border-dashed my-2" />
            {order.items?.map((item: any) => (
              <div key={item.Id} className="flex justify-between text-xs mb-1">
                <span className="flex-1 pr-2">{item.productName} x{item.quantity}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <hr className="border-dashed my-2" />
            <div className="flex justify-between text-xs"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600"><span>Discount</span><span>-${order.discountAmount.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between text-xs"><span>Tax</span><span>${order.taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-sm mt-1"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
            {order.cashReceived && (
              <>
                <div className="flex justify-between text-xs mt-1"><span>Cash Received</span><span>${Number(order.cashReceived).toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span>Change</span><span>${Number(order.changeGiven).toFixed(2)}</span></div>
              </>
            )}
            <hr className="border-dashed my-2" />
            <p className="text-center text-xs">{receiptFooter}</p>
          </div>
        </div>
        <div className="p-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">Close</button>
          <button onClick={handlePrint} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main POS Component ───────────────────────────────────────────────────────
export default function POSPage() {
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const fetchProducts = useCallback(() => {
    setProductsLoading(true);
    fetch(`${API_URL}/products`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setProductsData(d); })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Close customer dropdown when clicking outside the dropdown container
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const products = productsData;

  const { data: settingsData } = useGetSettingsQuery();
  const { data: ordersData, refetch: refetchOrders } = useGetOrdersQuery({ limit: 30 });
  const { data: customersData } = useGetCustomersQuery({ limit: 100 });
  const [orderStatusTab, setOrderStatusTab] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');

  const [createOrder, { isLoading: isCheckingOut }] = useCreateOrderMutation();
  const [validateDiscount] = useValidateDiscountMutation();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderType, setOrderType] = useState<'In-Store' | 'Online' | 'Pickup'>('In-Store');
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedPayment, setSelectedPayment] = useState<'Cash' | 'Card' | 'QR'>('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [notes, setNotes] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [viewingCustomerId, setViewingCustomerId] = useState<number | null>(null);

  const taxRate = settingsData?.taxRate ?? 8;
  const taxEnabled = settingsData?.taxEnabled ?? true;
  const storeName = settingsData?.storeName ?? 'MajetroDash POS';
  const receiptFooter = settingsData?.receiptFooter ?? 'Thank you for your purchase!';

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.Category)));
    return ['All', ...cats];
  }, [products]);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => { counts[p.Category] = (counts[p.Category] || 0) + 1; });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.Category === selectedCategory;
    const matchesSearch = p.Name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  }), [products, selectedCategory, searchTerm]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount?.amount ?? 0;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxEnabled ? taxableAmount * (taxRate / 100) : 0;
  const total = taxableAmount + tax;
  const change = selectedPayment === 'Cash' && cashReceived ? Number(cashReceived) - total : 0;

  // ─── Cart Actions ─────────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    const existing = cart.find((c) => c.productId === product.Id);
    const imageUrl = product.colors?.[0]?.images?.[0]?.imageUrl || product.images?.[0]?.imageUrl || '';
    if (existing) {
      if (existing.quantity >= product.Quantity) return;
      setCart(cart.map((c) => c.productId === product.Id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, {
        productId: product.Id, productName: product.Name, Category: product.Category,
        price: product.SalePrice ?? product.Price, image: imageUrl,
        stock: product.Quantity, quantity: 1,
      }]);
    }
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stock) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: number) => setCart(cart.filter((c) => c.productId !== productId));
  const isInCart = (id: number) => cart.some((c) => c.productId === id);
  const getCartQty = (id: number) => cart.find((c) => c.productId === id)?.quantity ?? 0;

  // ─── Discount ─────────────────────────────────────────────────────────────────
  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountError('');
    try {
      const result = await validateDiscount({ code: discountCode.trim(), orderTotal: subtotal }).unwrap();
      setAppliedDiscount({ code: result.discount.code, amount: result.discountAmount });
      toast.success(`Coupon applied: -$${result.discountAmount.toFixed(2)}`);
    } catch (err: any) {
      setDiscountError(err?.data?.message || 'Invalid coupon');
      setAppliedDiscount(null);
    }
  };

  const removeDiscount = () => { setAppliedDiscount(null); setDiscountCode(''); setDiscountError(''); };

  // ─── Checkout ────────────────────────────────────────────────────────────────
  const processCheckout = async () => {
    if (!cart.length) return;
    if (selectedPayment === 'Cash' && cashReceived && Number(cashReceived) < total) {
      toast.error('Cash received is less than total');
      return;
    }
    setShowCheckoutModal(true);
    setCheckoutStatus('processing');

    try {
      const order = await createOrder({
        customerName: customerName || 'Guest',
        customerId: customerId ?? undefined,
        orderType,
        paymentMethod: selectedPayment,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        taxAmount: tax,
        discountAmount,
        discountCode: appliedDiscount?.code,
        total,
        notes: notes || undefined,
        cashReceived: selectedPayment === 'Cash' && cashReceived ? Number(cashReceived) : undefined,
        changeGiven: selectedPayment === 'Cash' && cashReceived ? Math.max(0, change) : undefined,
      }).unwrap();

      setCompletedOrder(order);
      setCheckoutStatus('success');
      refetchOrders();
    } catch (err: any) {
      setCheckoutStatus('error');
      toast.error(err?.data?.message || 'Checkout failed');
    }
  };

  const clearAfterSuccess = () => {
    setCart([]);
    setCustomerName('');
    setCustomerId(null);
    setCashReceived('');
    setNotes('');
    setAppliedDiscount(null);
    setDiscountCode('');
    setShowCheckoutModal(false);
    setCheckoutStatus('idle');
    fetchProducts(); // refresh stock counts
    refetchOrders(); // refresh order panel
  };

  const cancelCheckout = () => {
    setShowCheckoutModal(false);
    setCheckoutStatus('idle');
  };

  const allOrders = ordersData?.orders ?? [];
  const recentOrders = orderStatusTab === 'all'
    ? allOrders
    : allOrders.filter((o) => o.status === orderStatusTab);
  const customers = customersData?.customers ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex mt-20">
      {/* ── Left: Product Grid ── */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {cat} <span className="opacity-70">({categoryCount[cat] ?? 0})</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {filteredProducts.map((product) => {
              const inCart = isInCart(product.Id);
              const qty = getCartQty(product.Id);
              const imgUrl = product.colors?.[0]?.images?.[0]?.imageUrl || product.images?.[0]?.imageUrl || '';
              const effectivePrice = product.SalePrice ?? product.Price;
              const outOfStock = product.Quantity === 0;

              return (
                <div key={product.Id} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-gray-900/40 transition-shadow ${outOfStock ? 'opacity-60' : ''}`}>
                  <div className="relative h-36 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    {imgUrl ? (
                      <img src={`${API_URL}/${imgUrl}`} alt={product.Name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                    {product.Quantity > 0 && product.Quantity <= 10 && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        Low Stock
                      </div>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                      </div>
                    )}
                    {product.SalePrice && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">SALE</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-0.5 line-clamp-1">{product.Name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100">${effectivePrice.toFixed(2)}</span>
                      {product.SalePrice && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 line-through">${product.Price.toFixed(2)}</span>
                      )}
                    </div>
                    {!inCart ? (
                      <button
                        onClick={() => addToCart(product)}
                        disabled={outOfStock}
                        className="w-full bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 py-1.5 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={15} /> Add
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-green-600 text-white rounded-lg px-2 py-1.5">
                        <button onClick={() => updateQty(product.Id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-green-700 rounded">
                          <Minus size={13} />
                        </button>
                        <span className="font-bold text-sm px-2">{qty}</span>
                        <button onClick={() => updateQty(product.Id, 1)} disabled={qty >= product.Quantity} className="w-6 h-6 flex items-center justify-center hover:bg-green-700 rounded disabled:opacity-40">
                          <Plus size={13} />
                        </button>
                        <Check size={14} className="ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Today's Orders Tracking Panel ── */}
        <div className="mt-6">
          {/* Panel header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Order Tracking</h2>
              <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
                {allOrders.length}
              </span>
            </div>
            <button onClick={() => refetchOrders()} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {([
              { key: 'all', label: 'All', icon: <ShoppingCart size={12} />, count: allOrders.length },
              { key: 'completed', label: 'Completed', icon: <CheckSquare size={12} />, count: allOrders.filter(o => o.status === 'completed').length },
              { key: 'pending', label: 'Pending', icon: <AlertCircle size={12} />, count: allOrders.filter(o => o.status === 'pending').length },
              { key: 'cancelled', label: 'Cancelled', icon: <Ban size={12} />, count: allOrders.filter(o => o.status === 'cancelled').length },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setOrderStatusTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  orderStatusTab === tab.key
                    ? tab.key === 'completed' ? 'bg-green-600 text-white'
                    : tab.key === 'pending' ? 'bg-yellow-500 text-white'
                    : tab.key === 'cancelled' ? 'bg-red-500 text-white'
                    : 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${orderStatusTab === tab.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Orders grid */}
          {recentOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No {orderStatusTab === 'all' ? '' : orderStatusTab} orders yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {recentOrders.map((order) => (
                <div key={order.Id} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/30 transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{order.orderNumber}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold capitalize ${
                      order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                      order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                      order.status === 'refunded' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' :
                      'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                    }`}>{order.status}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-0.5 truncate">{order.customerName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">{order.orderType} · {order.paymentMethod}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col max-h-screen sticky top-0">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={22} className="text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Cart</h2>
            {cart.length > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>

          {/* Order Type */}
          <div className="flex gap-1.5 mb-3">
            {(['In-Store', 'Online', 'Pickup'] as const).map((type) => (
              <button key={type} onClick={() => setOrderType(type)}
                className={`flex-1 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                  orderType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>{type}</button>
            ))}
          </div>

          {/* Customer */}
          <div className="relative mb-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Customer</label>
              {customerId && (
                <button
                  type="button"
                  onClick={() => setViewingCustomerId(customerId)}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <User size={11} /> View Profile
                </button>
              )}
            </div>
            <div className="relative" ref={customerDropdownRef}>
              <input
                type="text"
                value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); setCustomerId(null); setShowCustomerDropdown(true); }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Guest or customer name"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {customerId && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" title="Customer linked" />
              )}
              {!customerId && <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}

              {showCustomerDropdown && customers.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-30 max-h-44 overflow-y-auto mt-1">
                  {customers
                    .filter((c) => c.name.toLowerCase().includes(customerName.toLowerCase()))
                    .slice(0, 6)
                    .map((c) => (
                      <button
                        key={c.Id}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between gap-2 border-b border-gray-50 dark:border-gray-700 last:border-0"
                        onClick={() => {
                          setCustomerName(c.name);
                          setCustomerId(c.Id);
                          setShowCustomerDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
                            {c.phone && <p className="text-xs text-gray-400 dark:text-gray-500">{c.phone}</p>}
                          </div>
                        </div>
                        {(c as any).totalSpend > 0 && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium shrink-0">
                            ${(c as any).totalSpend.toFixed(0)} spent
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes (optional)"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <ShoppingCart size={44} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium text-sm">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={`${API_URL}/${item.image}`} alt={item.productName} className="w-full h-full object-cover" />
                    ) : <span className="text-2xl">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-xs mb-1 line-clamp-1">{item.productName}</h3>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.productId, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-xs w-6 text-center text-gray-900 dark:text-gray-100">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, 1)} disabled={item.quantity >= item.stock} className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded">
                      <Trash2 size={15} />
                    </button>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Panel */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 shrink-0 space-y-3">
          {/* Discount Code */}
          <div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  disabled={!!appliedDiscount}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              {appliedDiscount ? (
                <button onClick={removeDiscount} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 border border-red-200">
                  <X size={14} />
                </button>
              ) : (
                <button onClick={applyDiscount} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 border border-blue-200">
                  Apply
                </button>
              )}
            </div>
            {discountError && <p className="text-red-500 text-xs mt-1">{discountError}</p>}
            {appliedDiscount && <p className="text-green-600 text-xs mt-1">✓ {appliedDiscount.code} applied (-${appliedDiscount.amount.toFixed(2)})</p>}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-green-600 dark:text-green-400"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>}
            {taxEnabled && <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Tax ({taxRate}%)</span><span>${tax.toFixed(2)}</span></div>}
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-gray-100 pt-1 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex gap-2">
            {(['Cash', 'Card', 'QR'] as const).map((method) => (
              <button key={method} onClick={() => setSelectedPayment(method)}
                className={`flex-1 py-2.5 border-2 rounded-lg font-medium flex items-center justify-center gap-1 text-xs transition-colors ${
                  selectedPayment === method ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                {method === 'Cash' && <Smartphone size={14} />}
                {method === 'Card' && <CreditCard size={14} />}
                {method === 'QR' && <QrCode size={14} />}
                {method}
              </button>
            ))}
          </div>

          {/* Cash Received */}
          {selectedPayment === 'Cash' && (
            <div>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="Cash received (optional)"
                min={0}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {cashReceived && Number(cashReceived) >= total && (
                <p className="text-green-600 text-xs mt-1 font-medium">Change: ${Math.max(0, change).toFixed(2)}</p>
              )}
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={processCheckout}
            disabled={cart.length === 0 || isCheckingOut}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCheckingOut ? 'Processing...' : `Checkout — $${total.toFixed(2)}`}
          </button>
        </div>
      </div>


      {/* ── Checkout Modal ── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            {checkoutStatus === 'processing' && (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">Processing Payment</h3>
                <p className="text-gray-500 text-sm mb-6">Please wait while we process your {selectedPayment.toLowerCase()} payment…</p>
                <button onClick={cancelCheckout} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            )}

            {checkoutStatus === 'success' && completedOrder && (
              <div className="text-center py-4">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={36} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Payment Successful!</h3>
                <p className="text-gray-500 text-sm mb-4">Order {completedOrder.orderNumber} placed</p>
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Order</span><span className="font-semibold">{completedOrder.orderNumber}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Customer</span><span className="font-semibold">{completedOrder.customerName}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Payment</span><span className="font-semibold">{completedOrder.paymentMethod}</span></div>
                  {completedOrder.changeGiven > 0 && (
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Change</span><span className="font-semibold">${completedOrder.changeGiven.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-1 border-t"><span>Total</span><span className="text-green-600">${completedOrder.total.toFixed(2)}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowReceipt(true); setShowCheckoutModal(false); }} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-1.5">
                    <Printer size={15} /> Receipt
                  </button>
                  <button
                    onClick={clearAfterSuccess}
                    disabled={productsLoading}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {productsLoading
                      ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Refreshing…</>
                      : <><RefreshCw size={14} /> New Sale</>}
                  </button>
                </div>
              </div>
            )}

            {checkoutStatus === 'error' && (
              <div className="text-center py-4">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={36} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Payment Failed</h3>
                <p className="text-gray-500 text-sm mb-4">There was an error processing your payment</p>
                <div className="flex gap-2">
                  <button onClick={cancelCheckout} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={() => { setCheckoutStatus('idle'); processCheckout(); }}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700">
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Receipt Modal ── */}
      {showReceipt && completedOrder && (
        <ReceiptModal
          order={completedOrder}
          storeName={storeName}
          receiptFooter={receiptFooter}
          onClose={() => { setShowReceipt(false); clearAfterSuccess(); }}
        />
      )}

      {/* ── Customer Profile Modal ── */}
      {viewingCustomerId && (
        <CustomerProfileModal
          customerId={viewingCustomerId}
          onClose={() => setViewingCustomerId(null)}
        />
      )}
    </div>
  );
}

// ─── Customer Profile Modal (used inside POS) ─────────────────────────────────
function CustomerProfileModal({ customerId, onClose }: { customerId: number; onClose: () => void }) {
  const { data: customer, isLoading } = useGetCustomerQuery(customerId);
  const orders: any[] = (customer as any)?.orders ?? [];
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const totalSpend = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + o.total, 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            {customer && (
              <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight">{customer?.name ?? '...'}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Customer Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-5 space-y-4">

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

            {/* Contact */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3.5 space-y-1.5">
              {customer?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail size={13} className="text-gray-400 shrink-0" /> {customer.email}
                </div>
              )}
              {customer?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone size={13} className="text-gray-400 shrink-0" /> {customer.phone}
                </div>
              )}
              {customer?.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin size={13} className="text-gray-400 shrink-0" /> {customer.address}
                </div>
              )}
            </div>

            {/* Purchase history */}
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
                <Receipt size={14} className="text-gray-500" /> Purchase History
              </h4>
              {orders.length === 0 ? (
                <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                  <ShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((o: any) => {
                    const isExpanded = expandedOrder === o.Id;
                    return (
                      <div key={o.Id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : o.Id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                              <Receipt size={13} className="text-gray-500 dark:text-gray-400" />
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
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="font-bold text-sm text-gray-900 dark:text-gray-100">${o.total.toFixed(2)}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${
                                o.status === 'completed' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                                o.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                                'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                              }`}>{o.status}</span>
                            </div>
                            <ChevronDown size={13} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

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
                              <span>Order Total</span><span>${o.total.toFixed(2)}</span>
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

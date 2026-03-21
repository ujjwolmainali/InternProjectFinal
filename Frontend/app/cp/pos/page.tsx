'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, X, Minus, Plus, ShoppingCart, CreditCard, Smartphone, QrCode, Clock, Trash2, Check, Package, Star, CheckCircle, XCircle 
} from 'lucide-react';
import api from '@/app/lib/axios';

interface ProductColorImage {
  Id: number;
  colorId: number;
  imageUrl: string;
}
const apiurl = process.env.NEXT_PUBLIC_API_URL;
interface ProductColor {
  Id: number;
  productId: number;
  color: string;
  images: ProductColorImage[];
}

interface Product {
  Id: number;
  Name: string;
  Category: string;
  Price: number;
  SalePrice: number;
  Quantity: number;
  Description: string;
  Status: string;
  IsFeatured: boolean;
  createdAt: string;
  images: string[];
  colors: ProductColor[];
}



interface CartItem {
  Id: number;
  Name: string;
  Category: string;
  Price: number;
  image: string;
  stock: number;
  quantity: number;
}

interface SavedOrder {
  id: string;
  type: 'In-Store' | 'Online' | 'Pickup';
  customer: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  timestamp: Date;
}

const CATEGORIES = ['All', 'Electronics', 'Kitchen', 'Stationery'];


export default function EcommercePOS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']); 
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderType, setOrderType] = useState<'In-Store' | 'Online' | 'Pickup'>('In-Store');
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<'Cash' | 'Card' | 'QR'>('Cash');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'processing' | 'success' | 'error' | null>(null);
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await api.get<Product[]>("/products");
      const data = res.data;

      setProducts(data);

      // Extract unique categories safely
      const uniqueCategories = Array.from(
        new Set(data.map(p => p.Category))
      );

      setCategories(['All', ...uniqueCategories]);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  fetchProducts();
}, []);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };

    products.forEach(p => {
      counts[p.Category] = (counts[p.Category] || 0) + 1;
    });

    return counts;
  }, [products]);


  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.Category === selectedCategory;
      const matchesSearch = p.Name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const addToCart = (product: Product) => {
    const existing = cart.find(c => c.Id === product.Id);
    const imageUrl =
      product.colors?.[0]?.images?.[0]?.imageUrl ||
      product.images?.[0] ||
      '';

    if (existing) {
      setCart(cart.map(c => c.Id === product.Id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { 
        Id: product.Id, 
        Name: product.Name, 
        Category: product.Category, 
        Price: product.SalePrice || product.Price, 
        image: imageUrl, 
        stock: product.Quantity, 
        quantity: 1 
      }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map(item => {
      if (item.Id === id) {
        const newQty = item.quantity + change;
        if (newQty <= 0) return null;
        if (newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter((i): i is CartItem => i !== null));
  };

  const removeFromCart = (id: number) => setCart(cart.filter(item => item.Id !== id));
  const isInCart = (id: number) => cart.some(item => item.Id === id);
  const getCartQuantity = (id: number) => cart.find(item => item.Id === id)?.quantity || 0;

  const subtotal = cart.reduce((sum, item) => sum + (item.Price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const saveOrder = () => {
    if (!cart.length) return;
    const newOrder: SavedOrder = {
      id: `#${12361 + savedOrders.length + 1}`,
      type: orderType,
      customer: customerName || 'Guest',
      items: [...cart],
      total,
      paymentMethod: selectedPayment,
      timestamp: new Date()
    };
    setSavedOrders([newOrder, ...savedOrders]);
    setCart([]);
    setCustomerName('');
  };

  const processCheckout = () => {
    if (!cart.length) return;

    setShowCheckoutModal(true);
    setCheckoutStatus('processing');

    setTimeout(() => {
      // Reduce stock
      const updatedProducts = products.map(p => {
        const cItem = cart.find(c => c.Id === p.Id);
        if (cItem) return { ...p, Quantity: p.Quantity - cItem.quantity };
        return p;
      });
      setProducts(updatedProducts);

      const newOrder: SavedOrder = {
        id: `#${12361 + savedOrders.length + 1}`,
        type: orderType,
        customer: customerName || 'Guest',
        items: [...cart],
        total,
        paymentMethod: selectedPayment,
        timestamp: new Date()
      };
      setSavedOrders([newOrder, ...savedOrders]);

      setCheckoutStatus('success');

      setTimeout(() => {
        setCart([]);
        setCustomerName('');
        setShowCheckoutModal(false);
        setCheckoutStatus(null);
      }, 2000);
    }, 2000);
  };

  const closeModal = () => {
    setShowCheckoutModal(false);
    setCheckoutStatus(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex mt-20">
      {/* Left Side - Products */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat} <span className="text-sm opacity-75">({categoryCount[cat]??0})</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredProducts.map(product => {
            const inCart = isInCart(product.Id);
            const quantity = getCartQuantity(product.Id);
            const imgUrl = product.colors?.[0]?.images?.[0]?.imageUrl || product.images?.[0] || '';

            return (
              <div key={product.Id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-40 bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  {imgUrl ? (
                    <img src={`${apiurl}/${imgUrl}`} alt={product.Name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">📦</span>
                  )}
                  {product.Quantity < 20 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Low Stock
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{product.Name}</h3>
                  <p className="text-base font-bold text-gray-900 mb-2">${(product.SalePrice || product.Price).toFixed(2)}</p>

                  {!inCart ? (
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.Quantity === 0}
                      className="w-full bg-white border-2 border-blue-200 text-blue-600 py-1.5 rounded font-medium hover:bg-blue-50 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} /> Add
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-green-600 text-white rounded px-2 py-1.5">
                      <button onClick={() => updateQuantity(product.Id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-green-700 rounded">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm px-2">{quantity}</span>
                      <button onClick={() => updateQuantity(product.Id, 1)} disabled={quantity >= product.Quantity} className="w-6 h-6 flex items-center justify-center hover:bg-green-700 rounded disabled:opacity-50">
                        <Plus size={14} />
                      </button>
                      <div className="ml-1 flex items-center gap-1">
                        <Check size={16} />
                        <span className="text-xs font-medium">Added</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Saved Orders */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {savedOrders.slice(0, 8).map(order => (
              <div key={order.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-gray-800">{order.id}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    order.type === 'In-Store' ? 'bg-blue-100 text-blue-600' :
                    order.type === 'Online' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {order.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{order.customer}</p>
                <p className="text-sm font-bold text-gray-900">${order.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{order.paymentMethod}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right Side - Cart & Checkout */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col max-h-screen">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={24} className="text-gray-700" />
            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
            {cart.length > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>

          {/* Order Type */}
          <div className="flex gap-2 mb-4">
            {(['In-Store', 'Online', 'Pickup'] as const).map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
                  orderType === type
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cart Items - Flexible Height */}
        <div>
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.Id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-20 h-20 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={`${apiurl}/${item.image}`}
                        alt={item.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{item.image}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">{item.Name}</h3>
                    <p className="text-base font-bold text-gray-900 mb-2">${item.Price.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.Id, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.Id, 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.Id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                    <p className="text-sm font-bold text-gray-900">
                      ${(item.Price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total and Payment */}
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
              <span>Total Amount</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedPayment('Cash')}
              className={`flex-1 py-3 border-2 rounded-lg font-medium flex items-center justify-center gap-1 text-sm transition-colors ${
                selectedPayment === 'Cash'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Smartphone size={16} /> Cash
            </button>
            <button
              onClick={() => setSelectedPayment('Card')}
              className={`flex-1 py-3 border-2 rounded-lg font-medium flex items-center justify-center gap-1 text-sm transition-colors ${
                selectedPayment === 'Card'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={16} /> Card
            </button>
            <button
              onClick={() => setSelectedPayment('QR')}
              className={`flex-1 py-3 border-2 rounded-lg font-medium flex items-center justify-center gap-1 text-sm transition-colors ${
                selectedPayment === 'QR'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <QrCode size={16} /> QR
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={saveOrder}
              disabled={cart.length === 0}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Order
            </button>
            <button
              onClick={processCheckout}
              disabled={cart.length === 0}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
 
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {checkoutStatus === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
                <p className="text-gray-600">Please wait while we process your {selectedPayment.toLowerCase()} payment...</p>
              </div>
            )}

            {checkoutStatus === 'success' && (
              <div className="text-center py-8">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-4">Your order has been completed successfully</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold">#{12361 + savedOrders.length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-semibold">{customerName || 'Guest'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-semibold">{selectedPayment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-lg text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {checkoutStatus === 'error' && (
              <div className="text-center py-8">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={40} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Failed</h3>
                <p className="text-gray-600 mb-4">There was an error processing your payment</p>
                <button
                  onClick={closeModal}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
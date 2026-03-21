'use client';

import React, { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

const INITIAL_CART: CartItem[] = [
  {
    id: 1,
    name: 'Wireless Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    price: 149.99,
    quantity: 2,
  },
  {
    id: 2,
    name: 'Smart Watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    price: 299.99,
    quantity: 1,
  },
  {
    id: 3,
    name: 'Laptop Stand',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    price: 49.99,
    quantity: 3,
  },
  {
    id: 4,
    name: 'USB-C Cable',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop',
    price: 19.99,
    quantity: 1,
  },
];

export default function POSOrderSection() {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [orderNumber] = useState<string>(`#${Math.floor(10000 + Math.random() * 90000)}`);

  const updateQuantity = (id: number, change: number): void => {
    setCartItems(
      cartItems
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) return null;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeItem = (id: number): void => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const clearOrder = (): void => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handlePayNow = (): void => {
    alert(`Processing payment for ${orderNumber}\nTotal: $${total.toFixed(2)}`);
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
        </div>
        <p className="text-sm text-gray-600 font-medium">Order {orderNumber}</p>
      </div>

      {/* Order Items List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ShoppingCart size={64} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">No items in order</p>
            <p className="text-sm">Add products to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-1 truncate">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600 mb-3">
                      ${item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} className="text-gray-600" />
                        </button>
                        <span className="font-bold text-gray-800 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} className="text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="ml-auto">
                        <p className="text-sm font-bold text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span className="font-medium">Tax (8%)</span>
            <span className="font-semibold">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
            <span>Total</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-5 border-t border-gray-200 space-y-3">
        <button
          onClick={clearOrder}
          disabled={cartItems.length === 0}
          className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          Clear Order
        </button>
        <button
          onClick={handlePayNow}
          disabled={cartItems.length === 0}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
        >
          Pay Now ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
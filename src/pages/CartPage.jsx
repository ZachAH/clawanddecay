import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Total in cents
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty text-center p-10">
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty.</h2>
        <p className="text-gray-600">Browse our products and add some cool merch!</p>
      </div>
    );
  }

  const confirmRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      removeFromCart(id);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      // Build payload: primary authoritative data should be resolved server-side.
      // Here we send id + quantity, plus optional metadata for logging/fallback.
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id, // should correspond to whatever your backend catalog/key is
            quantity: item.quantity,
            // Optional: include title and price for logging/debugging; backend should not trust price for amount.
            metadata: {
              title: item.title,
              client_price_cents: item.price,
              sku: item.sku,
            },
          })),
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Unexpected response:', data);
        alert('Failed to create checkout session.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <ul className="space-y-4">
        {cartItems.map(item => (
          <li
            key={item.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-4 rounded shadow-sm"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-gray-600">
                ${(item.price / 100).toFixed(2)} each
              </p>
              <p className="mt-1 font-medium">
                Subtotal: ${((item.price * item.quantity) / 100).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="flex items-center border rounded">
                <label htmlFor={`qty-${item.id}`} className="sr-only">
                  Quantity
                </label>
                <input
                  id={`qty-${item.id}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  className="w-16 px-2 py-1 text-center"
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (val >= 1) updateQuantity(item.id, val);
                  }}
                  disabled={loading}
                />
              </div>
              <button
                onClick={() => confirmRemove(item.id)}
                className="text-red-600 hover:text-red-800 font-semibold"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 text-right">
        <p className="text-xl font-bold">
          Total: ${(totalPrice / 100).toFixed(2)}
        </p>
        <button
          onClick={handleCheckout}
          disabled={loading || cartItems.length === 0}
          className={`mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow-lg transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            if (window.confirm('Clear the entire cart?')) clearCart();
          }}
          className="text-sm text-gray-500 underline hover:text-gray-700"
          disabled={loading}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}

export default CartPage;

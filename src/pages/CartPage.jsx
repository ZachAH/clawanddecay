import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty text-center p-10">
        <h2>Your cart is empty.</h2>
        <p>Browse our products and add some cool merch!</p>
      </div>
    );
  }

  // Confirm before removing an item
  const confirmRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      removeFromCart(id);
    }
  };

  // Handle Stripe checkout via Netlify function
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            name: item.title,
            quantity: item.quantity,
            price: item.price / 100, // convert cents to dollars for backend
          })),
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // redirect to Stripe checkout
      } else {
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
            className="flex justify-between items-center border p-4 rounded shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-gray-600">${(item.price / 100).toFixed(2)} each</p>
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="number"
                min={1}
                value={item.quantity}
                className="w-16 border rounded px-2 py-1 text-center"
                onChange={e => {
                  const val = Number(e.target.value);
                  if (val >= 1) updateQuantity(item.id, val);
                }}
              />
              <button
                onClick={() => confirmRemove(item.id)}
                className="text-red-600 hover:text-red-800 font-semibold"
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
          disabled={loading}
          className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}

export default CartPage;

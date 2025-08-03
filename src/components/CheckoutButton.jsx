import React from 'react';

export default function CheckoutButton({ cartItems }) {
  const handleCheckout = async () => {
    const res = await fetch('http://localhost:4242/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems })
    });

    const data = await res.json();
    window.location.href = data.url; // Redirect to Stripe Checkout
  };

  return (
    <button onClick={handleCheckout} className="bg-black text-white px-4 py-2">
      Checkout
    </button>
  );
}

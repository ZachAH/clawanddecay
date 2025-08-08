import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Local state for input values per item.cartItemId
  const [inputValues, setInputValues] = useState({});

  // Initialize or update inputValues when cartItems change
  useEffect(() => {
    const initialValues = Object.fromEntries(
      cartItems.map(item => [item.cartItemId, item.quantity.toString()])
    );
    setInputValues(initialValues);
  }, [cartItems]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const confirmRemove = (cartItemId) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      removeFromCart(cartItemId);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
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

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty.</h2>
        <p>Browse our products and add some cool merch!</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <ul className="cart-list">
        {cartItems.map(item => (
          <li key={item.cartItemId} className="cart-item">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="cart-item-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/fallback.png';
                }}
              />
            )}

            <div className="cart-item-details">
              <div>
                <h3>{item.title}</h3>
                <p>${(item.price / 100).toFixed(2)} each</p>
                <p>Subtotal: ${((item.price * item.quantity) / 100).toFixed(2)}</p>
              </div>

              <div className="cart-item-controls">
                <input
                  type="number"
                  min="1"
                  value={inputValues[item.cartItemId] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputValues(prev => ({
                      ...prev,
                      [item.cartItemId]: val,
                    }));
                  }}
                  onBlur={() => {
                    const val = inputValues[item.cartItemId];
                    const parsed = parseInt(val, 10);

                    if (!val || isNaN(parsed) || parsed < 1) {
                      setInputValues(prev => ({
                        ...prev,
                        [item.cartItemId]: '1',
                      }));
                      updateQuantity(item.cartItemId, 1);
                    } else {
                      updateQuantity(item.cartItemId, parsed);
                    }
                  }}
                  style={{
                    width: '60px',
                    marginRight: '10px',
                    padding: '5px',
                    textAlign: 'center',
                  }}
                  disabled={loading}
                />
                <button onClick={() => confirmRemove(item.cartItemId)} disabled={loading}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-total">
        <p>Total: ${(totalPrice / 100).toFixed(2)}</p>
        <button onClick={handleCheckout} disabled={loading || cartItems.length === 0}>
          {loading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>

      <div className="cart-clear">
        <button
          onClick={() => {
            if (window.confirm('Clear the entire cart?')) clearCart();
          }}
          disabled={loading}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}

export default CartPage;

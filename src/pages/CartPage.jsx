import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useCart } from '../context/CartContext';

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    const initialValues = Object.fromEntries(
      cartItems.map(item => [item.uniqueKey, item.quantity.toString()])
    );
    setInputValues(initialValues);
  }, [cartItems]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const confirmRemove = (uniqueKey) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      removeFromCart(uniqueKey);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
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
      <>
        <Helmet>
          <title>Your Cart — Claw &amp; Decay</title>
          <meta name="description" content="Your Claw & Decay shopping cart." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <section className="cart-empty" aria-labelledby="empty-cart-heading">
          <h2 id="empty-cart-heading">Your cart is empty.</h2>
          <p>Browse our products and add some cool merch!</p>
        </section>
      </>
    );
  }

  return (
    <section className="cart-page" aria-labelledby="cart-heading">
      <Helmet>
        <title>Your Cart — Claw &amp; Decay</title>
        <meta name="description" content="Review and check out the items in your Claw & Decay cart." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <h1 id="cart-heading">Your Cart</h1>
      <ul className="cart-list" aria-label="Items in your cart">
        {cartItems.map(item => (
          <li key={item.uniqueKey} className="cart-item">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={`${item.product_title} — ${item.variant_title}`}
                className="cart-item-image"
                loading="lazy"
                width="120"
                height="120"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/fallback.png';
                }}
              />
            )}

            <div className="cart-item-details">
              <div>
                <h3>{item.product_title} - {item.variant_title}</h3>
                <p>${(item.price / 100).toFixed(2)} each</p>
                <p>Subtotal: ${((item.price * item.quantity) / 100).toFixed(2)}</p>
              </div>

              <div className="cart-item-controls">
                <label htmlFor={`qty-${item.uniqueKey}`} className="visually-hidden">
                  Quantity for {item.product_title} {item.variant_title}
                </label>
                <input
                  id={`qty-${item.uniqueKey}`}
                  type="number"
                  min="1"
                  inputMode="numeric"
                  aria-label={`Quantity for ${item.product_title} ${item.variant_title}`}
                  value={inputValues[item.uniqueKey] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputValues(prev => ({
                      ...prev,
                      [item.uniqueKey]: val,
                    }));
                  }}
                  onBlur={() => {
                    const val = inputValues[item.uniqueKey];
                    const parsed = parseInt(val, 10);

                    if (!val || isNaN(parsed) || parsed < 1) {
                      setInputValues(prev => ({
                        ...prev,
                        [item.uniqueKey]: '1',
                      }));
                      updateQuantity(item.uniqueKey, 1);
                    } else {
                      updateQuantity(item.uniqueKey, parsed);
                    }
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => confirmRemove(item.uniqueKey)}
                  disabled={loading}
                  aria-label={`Remove ${item.product_title} ${item.variant_title} from cart`}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-total" aria-live="polite">
        <p>Total: ${(totalPrice / 100).toFixed(2)}</p>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || cartItems.length === 0}
          aria-busy={loading}
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>

      <div className="cart-clear">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Clear the entire cart?')) clearCart();
          }}
          disabled={loading}
          aria-label="Clear all items from cart"
        >
          Clear Cart
        </button>
      </div>
    </section>
  );
}

export default CartPage;
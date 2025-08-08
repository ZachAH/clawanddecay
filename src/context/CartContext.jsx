import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems(prev => {
      // Use variantId as the unique identifier for cart items
      const exists = prev.find(item => item.variantId === product.variantId);
  
      if (exists) {
        return prev.map(item =>
          item.variantId === product.variantId
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        // Ensure that the product object added to the cart
        // explicitly includes productId and variantId
        return [...prev, {
          ...product,
          productId: product.productId,
          variantId: product.variantId,
        }];
      }
    });
  };
  
  // Use variantId for removal
  const removeFromCart = (variantId) => {
    setCartItems(prev => prev.filter(item => item.variantId !== variantId));
  };
  
  // Use variantId for quantity update
  const updateQuantity = (variantId, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );
  };
  

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
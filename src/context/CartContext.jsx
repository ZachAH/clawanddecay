import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems(prev => {
      // Create a truly unique key from both IDs
      const uniqueKey = `${product.productId}-${product.variantId}`;
      const exists = prev.find(item => item.uniqueKey === uniqueKey);
  
      if (exists) {
        return prev.map(item =>
          item.uniqueKey === uniqueKey
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        // Add the new item with its unique key
        return [...prev, { ...product, uniqueKey }];
      }
    });
  };
  
  const removeFromCart = (uniqueKey) => {
    setCartItems(prev => prev.filter(item => item.uniqueKey !== uniqueKey));
  };
  
  const updateQuantity = (uniqueKey, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.uniqueKey === uniqueKey ? { ...item, quantity } : item
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
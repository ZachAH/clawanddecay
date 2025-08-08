import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.cartItemId === product.cartItemId);
  
      if (exists) {
        return prev.map(item =>
          item.cartItemId === product.cartItemId
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        return [...prev, product];
      }
    });
  };
  
  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };
  
  const updateQuantity = (cartItemId, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
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

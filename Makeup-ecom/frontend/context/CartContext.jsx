import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const addToCart = (product, quantity = 1, shade = null) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => item.product._id === product._id && item.shade === shade
      );
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product._id === product._id && item.shade === shade
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevCart, { product, quantity, shade }];
    });
  };

  const removeFromCart = (productId, shade) => {
    setCart(prevCart =>
      prevCart.filter(item => 
        !(item.product._id === productId && item.shade === shade)
      )
    );
  };

  const updateQuantity = (productId, shade, quantity) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product._id === productId && item.shade === shade
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item._id === product._id)) {
        return prev.filter(item => item._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        addToWishlist,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
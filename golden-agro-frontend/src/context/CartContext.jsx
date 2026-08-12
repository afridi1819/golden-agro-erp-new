import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToCart = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      let next;
      if (existing) {
        next = prev.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        next = [
          ...prev,
          {
            productId: product.productId,
            productName: product.productName,
            sellingPrice: product.sellingPrice,
            quantity,
          },
        ];
      }
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) => {
      const next = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + (i.sellingPrice || 0) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

function readCart() {
  try {
    return JSON.parse(localStorage.getItem('merkato-cart') || '[]');
  } catch {
    localStorage.removeItem('merkato-cart');
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  function update(nextItems) {
    setItems(nextItems);
    localStorage.setItem('merkato-cart', JSON.stringify(nextItems));
  }

  function addItem(product, quantity = 1) {
    const existing = items.find((item) => item._id === product._id);
    update(existing
      ? items.map((item) => item._id === product._id ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item)
      : [...items, { ...product, quantity: Math.min(product.stock, quantity) }]);
  }

  function setQuantity(id, quantity) {
    update(items.map((item) => item._id === id ? { ...item, quantity: Math.min(item.stock, Math.max(1, quantity)) } : item));
  }

  function removeItem(id) {
    update(items.filter((item) => item._id !== id));
  }

  function clear() {
    update([]);
  }

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addItem,
    setQuantity,
    removeItem,
    clear,
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

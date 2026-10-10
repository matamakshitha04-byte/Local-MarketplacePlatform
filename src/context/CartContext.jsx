import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

// Cart items: { product: {_id,name,price,image,category,quantity(stock),shopName}, quantity }
export function CartProvider({ children }) {
  const { user } = useAuth();
  const key = user ? `lm_cart_${user._id}` : null;
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!key) { setItems([]); return; }
    try { setItems(JSON.parse(localStorage.getItem(key)) || []); } catch { setItems([]); }
  }, [key]);

  useEffect(() => { if (key) localStorage.setItem(key, JSON.stringify(items)); }, [items, key]);

  const add = (product, qty = 1) => {
    const stock = product.quantity;
    const existing = items.find((i) => i.product._id === product._id);
    const next = (existing ? existing.quantity : 0) + qty;
    if (!product.isAvailable || stock < 1) return { ok: false, message: 'This product is out of stock' };
    if (next > stock) return { ok: false, message: `Only ${stock} available — requested quantity is unavailable` };
    const snapshot = {
      _id: product._id, name: product.name, price: product.price, image: product.image,
      category: product.category, quantity: stock, shopName: product.seller?.shopName || product.seller?.name,
    };
    setItems(existing ? items.map((i) => (i.product._id === product._id ? { product: snapshot, quantity: next } : i)) : [...items, { product: snapshot, quantity: next }]);
    return { ok: true, message: `${product.name} added to cart` };
  };
  const setQty = (id, qty) => {
    setItems((list) => list.map((i) => {
      if (i.product._id !== id) return i;
      return { ...i, quantity: Math.max(1, Math.min(qty, i.product.quantity)) };
    }));
  };
  const remove = (id) => setItems((list) => list.filter((i) => i.product._id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, total, count }}>{children}</CartContext.Provider>;
}

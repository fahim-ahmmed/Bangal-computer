"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { cartApi } from "@/lib/cart-client";
import { useSession } from "@/lib/auth-client";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const hasMerged = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const data = await cartApi.get();
      setCart(data);
    } catch (err) {
      console.error("[cart] refresh failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Right after login, merge whatever was in the guest cart into the
  // user's server-side cart, once per session.
  useEffect(() => {
    if (session?.user && !hasMerged.current) {
      hasMerged.current = true;
      cartApi
        .merge()
        .then(setCart)
        .catch((err) => console.error("[cart] merge failed:", err.message));
    }
    if (!session?.user) hasMerged.current = false;
  }, [session]);

  const addItem = useCallback(async (productId, variantId = null, qty = 1) => {
    const data = await cartApi.addItem(productId, variantId, qty);
    setCart(data);
    return data;
  }, []);

  const updateQty = useCallback(async (productId, qty, variantId = null) => {
    const data = await cartApi.updateQty(productId, qty, variantId);
    setCart(data);
    return data;
  }, []);

  const removeItem = useCallback(async (productId, variantId = null) => {
    const data = await cartApi.removeItem(productId, variantId);
    setCart(data);
    return data;
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateQty, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      cart: { items: [], subtotal: 0, itemCount: 0 },
      loading: false,
      addItem: async () => ({ items: [], subtotal: 0, itemCount: 0 }),
      updateQty: async () => ({ items: [], subtotal: 0, itemCount: 0 }),
      removeItem: async () => ({ items: [], subtotal: 0, itemCount: 0 }),
      refresh: async () => undefined,
    };
  }
  return ctx;
}

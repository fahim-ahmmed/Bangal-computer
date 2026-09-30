"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CompareContext = createContext(null);
const KEY = "bc_compare_list";
const MAX = 4;

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      setItems(saved);
    } catch {
      setItems([]);
    }
  }, []);

  const persist = useCallback((next) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const isInCompare = useCallback((id) => items.some((p) => p._id === id), [items]);

  const toggle = useCallback(
    (product) => {
      if (isInCompare(product._id)) {
        persist(items.filter((p) => p._id !== product._id));
        return { added: false };
      }
      if (items.length >= MAX) {
        return { added: false, limitReached: true };
      }
      persist([...items, product]);
      return { added: true };
    },
    [items, isInCompare, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  return (
    <CompareContext.Provider value={{ items, toggle, isInCompare, clear, max: MAX }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    return {
      items: [],
      toggle: () => ({ added: false }),
      isInCompare: () => false,
      clear: () => undefined,
      max: 4,
    };
  }
  return ctx;
}

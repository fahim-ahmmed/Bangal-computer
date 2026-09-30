"use client";

import { HeroUIProvider } from "@heroui/react";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";

export function Providers({ children }) {
  return (
    <HeroUIProvider>
      <CartProvider>
        <CompareProvider>{children}</CompareProvider>
      </CartProvider>
    </HeroUIProvider>
  );
}

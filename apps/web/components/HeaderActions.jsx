"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";

export default function HeaderActions() {
  const { cart = { itemCount: 0 } } = useCart();
  const { items: compareItems = [] } = useCompare();

  return (
      <nav aria-label="অ্যাকাউন্ট ও কেনাকাটা" className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
        <Link href="/wishlist" className="hidden text-sm font-medium text-neutral-700 transition-colors duration-200 hover:text-brand lg:inline-flex">
          উইশলিস্ট
        </Link>

        <Link href="/compare" className="relative hidden text-sm font-medium text-neutral-700 transition-colors duration-200 hover:text-brand lg:inline-flex">
          তুলনা
          {compareItems.length > 0 && (
            <span className="absolute -right-3 -top-2 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
              {compareItems.length}
            </span>
          )}
        </Link>

        <Link href="/account" className="text-sm font-medium text-neutral-700 transition-colors duration-200 hover:text-brand">
          অ্যাকাউন্ট
        </Link>

        <Link
          href="/cart"
          className="relative inline-flex items-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          কার্ট{cart.itemCount > 0 ? ` (${cart.itemCount})` : ""}
        </Link>
      </nav>
  );
}

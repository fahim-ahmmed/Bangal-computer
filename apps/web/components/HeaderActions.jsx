"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";

export default function HeaderActions() {
  const { cart = { itemCount: 0 } } = useCart();
  const { items: compareItems = [] } = useCompare();

  return (
    <nav aria-label="অ্যাকাউন্ট ও কেনাকাটা" className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
      <Link
        href="/wishlist"
        className="group hidden min-w-[66px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-brand lg:flex"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.8 8.7c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
        </svg>
        <span className="text-[11px] font-semibold">উইশলিস্ট</span>
      </Link>

      <Link
        href="/compare"
        className="group relative hidden min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-brand lg:flex"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H5a2 2 0 0 0-2 2v13h13v-3M10 3h11v11H10zM13 7h5M13 10h5" />
        </svg>
        <span className="text-[11px] font-semibold">তুলনা</span>
        {compareItems.length > 0 && (
          <span className="absolute right-1 top-0 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
            {compareItems.length}
          </span>
        )}
      </Link>

      <Link
        href="/account"
        className="group flex min-w-[62px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-brand"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="8" r="3.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 0 1 14 0" />
        </svg>
        <span className="text-[11px] font-semibold">অ্যাকাউন্ট</span>
      </Link>

      <Link
        href="/cart"
        className="group relative flex min-w-[62px] flex-col items-center gap-1 rounded-xl bg-brand px-2.5 py-2 text-white shadow-sm transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6" />
          <circle cx="10" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
        <span className="text-[11px] font-bold">কার্ট{cart.itemCount > 0 ? ` (${cart.itemCount})` : ""}</span>
      </Link>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatBDT } from "@/lib/format";

export default function CartPage() {
  const { cart, loading, updateQty, removeItem } = useCart();
  const router = useRouter();

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-neutral-400">লোড হচ্ছে...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">আপনার কার্ট খালি।</p>
        <Link href="/" className="text-brand hover:underline">
          কেনাকাটা শুরু করুন →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">আপনার কার্ট</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId || "base"}`}
            className="flex items-center gap-4 rounded-xl border border-neutral-200 p-4"
          >
            <Link href={`/product/${item.slug}`} className="h-20 w-20 shrink-0 rounded-lg bg-neutral-100 overflow-hidden flex items-center justify-center">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} className="h-full w-full object-contain" />
              ) : (
                <span className="text-[10px] text-neutral-300">ছবি নেই</span>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/product/${item.slug}`} className="font-medium text-neutral-800 hover:text-brand line-clamp-1">
                {item.title}
              </Link>
              {item.variantName && <div className="text-xs text-neutral-400">{item.variantName}</div>}
              <div className="text-brand font-semibold mt-1">{formatBDT(item.unitPrice)}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1), item.variantId)}
                className="h-8 w-8 rounded border border-neutral-300 text-neutral-600 hover:border-brand"
              >
                −
              </button>
              <span className="w-8 text-center">{item.qty}</span>
              <button
                onClick={() => updateQty(item.productId, item.qty + 1, item.variantId)}
                className="h-8 w-8 rounded border border-neutral-300 text-neutral-600 hover:border-brand"
              >
                +
              </button>
            </div>

            <div className="w-24 text-right font-semibold text-neutral-800">{formatBDT(item.lineTotal)}</div>

            <button
              onClick={() => removeItem(item.productId, item.variantId)}
              className="text-neutral-400 hover:text-red-500 text-sm"
            >
              মুছুন
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <div className="w-full md:w-80 rounded-xl border border-neutral-200 p-5">
          <div className="flex justify-between text-neutral-600 mb-2">
            <span>সাবটোটাল ({cart.itemCount} আইটেম)</span>
            <span className="font-semibold text-neutral-900">{formatBDT(cart.subtotal)}</span>
          </div>
          <Button color="danger" radius="sm" className="w-full mt-3" onClick={() => router.push("/checkout")}>
            চেকআউট করুন
          </Button>
        </div>
      </div>
    </div>
  );
}

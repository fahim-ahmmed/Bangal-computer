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
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-7xl items-center justify-center px-4">
        <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
          <p className="mt-4 text-sm font-medium text-neutral-500">আপনার কার্ট লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[55vh] bg-[#f5f6f7] px-4 py-10 sm:py-16">
        <section className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-brand">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand">আপনার শপিং ব্যাগ</p>
          <h1 className="mt-2 text-2xl font-extrabold text-neutral-950">আপনার কার্ট এখনো খালি</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            পছন্দের প্রযুক্তি পণ্য কার্টে যোগ করুন। আপনার বাছাই করা পণ্যগুলো এখানে দেখতে পাবেন।
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark">
            কেনাকাটা শুরু করুন <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[55vh] bg-[#f5f6f7]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">আপনার শপিং ব্যাগ</p>
            <h1 className="mt-1 text-2xl font-extrabold text-neutral-950 sm:text-3xl">আপনার কার্ট</h1>
            <p className="mt-1 text-sm text-neutral-500">{cart.itemCount}টি পণ্য আপনার কার্টে আছে</p>
          </div>
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-dark">
            <span aria-hidden="true">←</span> কেনাকাটা চালিয়ে যান
          </Link>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
          <section aria-label="কার্টের পণ্য" className="space-y-3">
            {cart.items.map((item) => (
              <article
                key={`${item.productId}-${item.variantId || "base"}`}
                className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4"
              >
                <div className="flex gap-3 sm:gap-4">
                  <Link href={`/product/${item.slug}`} className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 sm:h-28 sm:w-28">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.title} className="h-full w-full object-contain p-2" />
                    ) : (
                      <span className="text-xs text-neutral-400">ছবি নেই</span>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-bold leading-6 text-neutral-900 transition-colors hover:text-brand sm:text-base">
                        {item.title}
                      </Link>
                      {item.variantName && <div className="mt-1 text-xs text-neutral-500">{item.variantName}</div>}
                      <div className="mt-2 text-sm font-bold text-brand">{formatBDT(item.unitPrice)}</div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                      <div className="inline-flex items-center rounded-lg border border-neutral-200">
                        <button
                          type="button"
                          aria-label={`${item.title} পরিমাণ কমান`}
                          onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1), item.variantId)}
                          className="h-9 w-9 rounded-l-lg text-lg text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-brand"
                        >
                          −
                        </button>
                        <span className="min-w-9 text-center text-sm font-semibold text-neutral-800">{item.qty}</span>
                        <button
                          type="button"
                          aria-label={`${item.title} পরিমাণ বাড়ান`}
                          onClick={() => updateQty(item.productId, item.qty + 1, item.variantId)}
                          className="h-9 w-9 rounded-r-lg text-lg text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-brand"
                        >
                          +
                        </button>
                      </div>
                      <div className="min-w-24 text-right text-sm font-bold text-neutral-900">{formatBDT(item.lineTotal)}</div>
                      <button
                        type="button"
                        aria-label={`${item.title} কার্ট থেকে মুছুন`}
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="rounded-lg px-2 py-2 text-xs font-semibold text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        মুছুন
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-52">
            <h2 className="text-lg font-extrabold text-neutral-950">অর্ডার সারাংশ</h2>
            <div className="mt-5 space-y-3 border-b border-neutral-100 pb-5 text-sm">
              <div className="flex justify-between gap-3 text-neutral-600">
                <span>পণ্যের সংখ্যা</span>
                <span>{cart.itemCount}টি</span>
              </div>
              <div className="flex justify-between gap-3 text-neutral-600">
                <span>সাবটোটাল</span>
                <span className="font-semibold text-neutral-900">{formatBDT(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-3 text-neutral-600">
                <span>ডেলিভারি চার্জ</span>
                <span className="text-xs text-neutral-500">চেকআউটে হিসাব হবে</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="font-bold text-neutral-900">মোট</span>
              <span className="text-lg font-extrabold text-brand">{formatBDT(cart.subtotal)}</span>
            </div>
            <Button color="danger" radius="sm" className="mt-5 w-full font-bold" onClick={() => router.push("/checkout")}>
              চেকআউট করুন <span aria-hidden="true">→</span>
            </Button>
            <p className="mt-3 text-center text-xs leading-5 text-neutral-500">
              নিরাপদে অর্ডার সম্পন্ন করতে চেকআউটে যান।
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

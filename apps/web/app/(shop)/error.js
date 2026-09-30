"use client";

export default function ShopError({ error, reset }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-xl font-bold text-neutral-900">কিছু একটা সমস্যা হয়েছে</h1>
      <p className="mt-2 text-sm text-neutral-500">{error?.message || "একটা অপ্রত্যাশিত এরর হয়েছে।"}</p>
      <button onClick={reset} className="mt-6 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
        আবার চেষ্টা করুন
      </button>
    </div>
  );
}

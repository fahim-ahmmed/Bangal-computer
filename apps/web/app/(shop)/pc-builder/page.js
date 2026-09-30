"use client";

import { useEffect, useState, useCallback } from "react";
import { builderApi } from "@/lib/tools-client";
import { formatBDT } from "@/lib/format";
import { useCart } from "@/context/CartContext";

export default function PcBuilderPage() {
  const [slots, setSlots] = useState([]);
  const [productsBySlot, setProductsBySlot] = useState({});
  const [selections, setSelections] = useState({});
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    builderApi
      .slots()
      .then(setSlots)
      .catch((e) => setError(e.message));
  }, []);

  const loadSlotProducts = useCallback(async (key) => {
    if (productsBySlot[key]) return;
    try {
      const products = await builderApi.slotProducts(key);
      setProductsBySlot((s) => ({ ...s, [key]: products }));
    } catch {
      setProductsBySlot((s) => ({ ...s, [key]: [] }));
    }
  }, [productsBySlot]);

  useEffect(() => {
    slots.filter((s) => s.subcategoryId).forEach((s) => loadSlotProducts(s.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  function select(key, productId) {
    setSelections((s) => (productId ? { ...s, [key]: productId } : Object.fromEntries(Object.entries(s).filter(([k]) => k !== key))));
    setResult(null);
  }

  async function checkCompatibility() {
    setChecking(true);
    setError(null);
    try {
      setResult(await builderApi.check(selections));
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  async function addAllToCart() {
    try {
      await Promise.all(Object.values(selections).map((id) => addItem(id)));
      alert("সব কম্পোনেন্ট কার্টে যোগ করা হয়েছে");
    } catch (err) {
      alert(err.message);
    }
  }

  const unmapped = slots.filter((s) => !s.subcategoryId);
  const selectedCount = Object.keys(selections).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">PC Builder</h1>
      <p className="mb-6 text-sm text-neutral-500">কম্পোনেন্ট বাছুন — কম্প্যাটিবিলিটি চেক ও মোট দাম দেখুন।</p>

      {unmapped.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          কিছু স্লট এখনো সাবক্যাটাগরির সাথে যুক্ত করা হয়নি ({unmapped.map((s) => s.label).join(", ")}) — অ্যাডমিন প্যানেলের
          &quot;Extra Tools&quot; পেজ থেকে এটা কনফিগার করুন।
        </div>
      )}

      <div className="space-y-4">
        {slots.map((slot) => {
          const products = productsBySlot[slot.key] || [];
          const selected = products.find((p) => p._id === selections[slot.key]);
          return (
            <div key={slot.key} className="rounded-xl border border-neutral-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-neutral-800">
                  {slot.label} {slot.required && <span className="text-red-500">*</span>}
                </h2>
                {selected && <span className="text-sm font-semibold text-brand">{formatBDT(selected.discountPrice || selected.price)}</span>}
              </div>
              {!slot.subcategoryId ? (
                <p className="text-sm text-neutral-400">কনফিগার করা হয়নি</p>
              ) : (
                <select
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={selections[slot.key] || ""}
                  onChange={(e) => select(slot.key, e.target.value)}
                >
                  <option value="">— বাছুন —{!slot.required ? " (ঐচ্ছিক)" : ""}</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} — {formatBDT(p.discountPrice || p.price)} {p.stock <= 0 ? "(স্টকে নেই)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={checkCompatibility}
          disabled={selectedCount === 0 || checking}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {checking ? "চেক হচ্ছে..." : "কম্প্যাটিবিলিটি চেক করুন"}
        </button>
        {result?.compatible && (
          <button onClick={addAllToCart} className="rounded-md border border-brand px-5 py-2.5 text-sm font-medium text-brand hover:bg-brand/5">
            সব কার্টে যোগ করুন
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {result && (
        <div className={`mt-6 rounded-xl border p-5 ${result.compatible ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <div className={`mb-2 font-semibold ${result.compatible ? "text-green-700" : "text-red-700"}`}>
            {result.compatible ? "✓ সব কম্পোনেন্ট কম্প্যাটিবল" : "⚠ সম্ভাব্য সমস্যা পাওয়া গেছে"}
          </div>
          {result.issues.length > 0 && (
            <ul className="mb-3 list-disc pl-5 text-sm text-red-600">
              {result.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          )}
          <div className="text-lg font-bold text-neutral-900">মোট দাম: {formatBDT(result.totalPrice)}</div>
          <p className="mt-1 text-xs text-neutral-500">স্পেক টেক্সট থেকে স্বয়ংক্রিয়ভাবে যাচাই করা — নিশ্চিত হতে চূড়ান্ত কেনার আগে বিস্তারিত স্পেক নিজে দেখে নিন।</p>
        </div>
      )}
    </div>
  );
}

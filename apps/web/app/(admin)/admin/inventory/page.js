"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, UI } from "@/lib/admin-api";

export default function AdminInventoryPage() {
  const [threshold, setThreshold] = useState(5);
  const [items, setItems] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await adminFetch(`/products/admin/low-stock?threshold=${threshold}`);
      setItems(json.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveStock(p) {
    try {
      await adminFetch(`/products/${p._id}/stock`, { method: "PATCH", body: { stock: Number(edits[p._id]) } });
      setEdits((e) => {
        const { [p._id]: _, ...rest } = e;
        return rest;
      });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-neutral-900">ইনভেন্টরি — লো-স্টক অ্যালার্ট</h1>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          এই সংখ্যা বা তার কম স্টক:
          <input type="number" min="0" className={`${UI.input} w-20`} value={threshold} onChange={(e) => setThreshold(Math.max(0, Number(e.target.value) || 0))} />
        </label>
      </div>
      <p className="mb-3 text-xs text-neutral-400">এখানে প্রোডাক্টের মূল স্টক দেখানো/বদলানো যায়; ভ্যারিয়েন্টের স্টক প্রোডাক্ট এডিট মোডাল থেকে বদলাতে হবে।</p>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      {loading && <p className="text-neutral-400">লোড হচ্ছে...</p>}
      {!loading && items.length === 0 && <p className="text-neutral-400">সব প্রোডাক্টের স্টক যথেষ্ট আছে।</p>}

      <div className="space-y-2">
        {items.map((p) => (
          <div key={p._id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
              {p.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt="" className="h-full w-full object-contain" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-sm font-medium text-neutral-800">{p.title}</div>
              <div className="text-xs text-neutral-400">{p.sku} · {p.status === "published" ? "পাবলিশড" : "ড্রাফট"}</div>
            </div>
            <div className={`text-sm font-bold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>{p.stock === 0 ? "স্টক শেষ" : `${p.stock}টি বাকি`}</div>
            <input type="number" min="0" className={`${UI.input} w-24`} placeholder="নতুন স্টক" value={edits[p._id] ?? ""} onChange={(e) => setEdits((s) => ({ ...s, [p._id]: e.target.value }))} />
            <button disabled={edits[p._id] === undefined || edits[p._id] === ""} onClick={() => saveStock(p)} className={UI.btn}>
              আপডেট
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

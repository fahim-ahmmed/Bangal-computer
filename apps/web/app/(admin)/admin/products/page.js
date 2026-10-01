"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, UI } from "@/lib/admin-api";
import { formatBDT } from "@/lib/format";
import ProductModal from "@/components/admin/ProductModal";

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | { id?: string }
  const [importResult, setImportResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("q", search);
      if (status) params.set("status", status);
      if (deleted) params.set("deleted", "true");
      const json = await adminFetch(`/products/admin/all?${params}`);
      setItems(json.data);
      setPagination(json.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, deleted]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(fn) {
    try {
      await fn();
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  const publish = (p) =>
    act(() => adminFetch(`/products/${p._id}/status`, { method: "PATCH", body: { status: "published" } }));

  const remove = (p) => {
    if (!window.confirm(`"${p.title}" মুছে ফেলবেন?\n(ডাটা মুছবে না — সাইট থেকে লুকানো থাকবে, "মুছে ফেলা" ফিল্টার থেকে ফেরত আনা যাবে)`)) return;
    act(() => adminFetch(`/products/${p._id}`, { method: "DELETE" }));
  };

  const restore = (p) => act(() => adminFetch(`/products/${p._id}/restore`, { method: "PATCH" }));

  async function onImport(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await adminFetch("/products/bulk-import", { method: "POST", body: fd });
      setImportResult(data);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">ক্যাটালগ পরিচালনা</p>
          <h1 className="mt-1 text-2xl font-extrabold text-neutral-950">প্রোডাক্ট</h1>
          <p className="mt-1 text-sm text-neutral-500">প্রকাশিত পণ্য স্টকে না থাকলেও সাইটে থাকবে—মুছলে তবেই লুকানো হবে।</p>
        </div>
        <div className="flex gap-2">
          <label className={`${UI.btnGhost} cursor-pointer`}>
            বাল্ক ইমপোর্ট (CSV/Excel)
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onImport} />
          </label>
          <button onClick={() => setModal({})} className={UI.btn}>
            + নতুন প্রোডাক্ট
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(q.trim());
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <input className={`${UI.input} max-w-xs`} placeholder="নাম বা SKU দিয়ে খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={`${UI.input} w-auto`} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">সব স্ট্যাটাস</option>
          <option value="published">পাবলিশড</option>
          <option value="draft">ড্রাফট</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" checked={deleted} onChange={(e) => { setPage(1); setDeleted(e.target.checked); }} />
          মুছে ফেলা প্রোডাক্ট
        </label>
        <button className={UI.btnGhost}>খুঁজুন</button>
      </form>

      {importResult && (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-3 text-sm">
          <div className="flex justify-between">
            <span>
              ইমপোর্ট শেষ: <b className="text-green-600">{importResult.created}টি তৈরি</b>, {importResult.skipped.length}টি স্কিপড, {importResult.errors.length}টি এরর
            </span>
            <button onClick={() => setImportResult(null)} className="text-neutral-400 hover:text-neutral-700">×</button>
          </div>
          {[...importResult.skipped, ...importResult.errors].slice(0, 10).map((r, i) => (
            <div key={i} className="text-xs text-neutral-500">
              রো {r.row}: {r.reason || r.message}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
            <tr>
              <th className="p-3">প্রোডাক্ট</th>
              <th className="p-3">ক্যাটাগরি / ব্র্যান্ড</th>
              <th className="p-3">দাম</th>
              <th className="p-3">স্টক</th>
              <th className="p-3">স্ট্যাটাস</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-400">লোড হচ্ছে...</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-400">কোনো প্রোডাক্ট নেই — "+ নতুন প্রোডাক্ট" চাপুন।</td></tr>
            )}
            {!loading &&
              items.map((p) => (
                <tr key={p._id} className="border-t border-neutral-100">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
                        {p.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt="" className="h-full w-full object-contain" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="line-clamp-1 font-medium text-neutral-800">{p.title}</div>
                        <div className="text-xs text-neutral-400">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-neutral-600">
                    {p.categoryId?.name} › {p.subcategoryId?.name}
                    <div className="text-neutral-400">{p.brandId?.name}</div>
                  </td>
                  <td className="p-3">
                    {p.discountPrice ? (
                      <>
                        <div className="font-semibold text-brand">{formatBDT(p.discountPrice)}</div>
                        <div className="text-xs text-neutral-400 line-through">{formatBDT(p.price)}</div>
                      </>
                    ) : (
                      <div className="font-semibold">{formatBDT(p.price)}</div>
                    )}
                  </td>
                  <td className={`p-3 ${p.stock <= 5 ? "font-semibold text-red-500" : ""}`}>{p.stock}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.status === "published" ? "পাবলিশড" : "ড্রাফট"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    {deleted ? (
                      <button onClick={() => restore(p)} className="text-brand hover:underline">ফেরত আনুন</button>
                    ) : (
                      <div className="flex justify-end gap-3 text-xs">
                        <button onClick={() => setModal({ id: p._id })} className="text-brand hover:underline">এডিট</button>
                        {p.status !== "published" && <button onClick={() => publish(p)} className="text-green-700 hover:underline">পাবলিশ</button>}
                        <button onClick={() => remove(p)} className="text-red-500 hover:underline">মুছুন</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={UI.btnGhost}>← আগে</button>
          <span className="text-neutral-500">{page} / {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className={UI.btnGhost}>পরে →</button>
        </div>
      )}

      {modal && <ProductModal productId={modal.id || null} onClose={() => setModal(null)} onSaved={load} />}
    </div>
  );
}

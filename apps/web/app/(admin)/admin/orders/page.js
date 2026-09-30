"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, UI } from "@/lib/admin-api";
import { formatBDT } from "@/lib/format";

const STATUS_LABEL = { pending: "অপেক্ষমাণ", confirmed: "কনফার্মড", shipped: "শিপড", delivered: "ডেলিভারড", returned: "রিটার্নড", cancelled: "বাতিল" };
// Must mirror the allowed transitions in apps/api/src/routes/orders.js
const NEXT = { pending: ["confirmed", "cancelled"], confirmed: ["shipped", "cancelled"], shipped: ["delivered", "returned"], delivered: ["returned"], returned: [], cancelled: [] };
const METHOD = { cod: "COD", bkash: "bKash", nagad: "Nagad", card: "কার্ড" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (status) params.set("status", status);
      const json = await adminFetch(`/orders/admin/all?${params}`);
      setOrders(json.data);
      setPagination(json.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

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

  const setOrderStatus = (o, next) => {
    if (next === "cancelled" && !window.confirm("অর্ডার বাতিল করলে স্টক ফেরত যাবে। নিশ্চিত?")) return;
    act(() => adminFetch(`/orders/${o._id}/status`, { method: "PATCH", body: { status: next } }));
  };
  const decideReturn = (o, decision) => act(() => adminFetch(`/orders/${o._id}/return`, { method: "PATCH", body: { decision } }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">অর্ডার</h1>
        <select className={`${UI.input} w-auto`} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">সব স্ট্যাটাস</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      {loading && <p className="text-neutral-400">লোড হচ্ছে...</p>}
      {!loading && orders.length === 0 && <p className="text-neutral-400">কোনো অর্ডার নেই।</p>}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="rounded-xl border border-neutral-200 bg-white">
            <button onClick={() => setOpen(open === o._id ? null : o._id)} className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left">
              <div>
                <div className="font-mono text-xs text-neutral-500">#{o._id.slice(-8).toUpperCase()}</div>
                <div className="text-sm text-neutral-700">{o.shippingAddress?.phone} · {o.userId ? "রেজিস্টার্ড" : "গেস্ট"}</div>
              </div>
              <div className="text-sm text-neutral-500">{new Date(o.createdAt).toLocaleString("bn-BD")}</div>
              <div className="text-sm">{METHOD[o.paymentMethod]} · {o.paymentStatus === "paid" ? "পরিশোধিত" : o.paymentStatus === "failed" ? "ব্যর্থ" : "বাকি"}</div>
              <div className="font-semibold">{formatBDT(o.total)}</div>
              <div className="flex items-center gap-2">
                {o.returnRequest?.status === "requested" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">রিটার্ন রিকোয়েস্ট</span>}
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">{STATUS_LABEL[o.status]}</span>
              </div>
            </button>

            {open === o._id && (
              <div className="space-y-3 border-t border-neutral-100 p-4 text-sm">
                <ul className="divide-y divide-neutral-100">
                  {o.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between py-1">
                      <span>{i.title} × {i.qty}</span>
                      <span>{formatBDT(i.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-neutral-600">
                  সাবটোটাল {formatBDT(o.subtotal)}
                  {o.discount > 0 && <> · কুপন {o.couponCode}: −{formatBDT(o.discount)}</>} · ডেলিভারি {formatBDT(o.shippingFee)} · <b>মোট {formatBDT(o.total)}</b>
                </div>
                <div className="text-neutral-600">
                  ঠিকানা: {o.shippingAddress.line1}, {o.shippingAddress.area ? `${o.shippingAddress.area}, ` : ""}{o.shippingAddress.city} · ফোন {o.shippingAddress.phone}
                  {o.guestEmail && <> · {o.guestEmail}</>}
                </div>

                {o.returnRequest?.status && (
                  <div className="rounded-lg bg-amber-50 p-3">
                    <b>রিটার্ন রিকোয়েস্ট ({o.returnRequest.status}):</b> {o.returnRequest.reason}
                    {o.returnRequest.status === "requested" && (
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => decideReturn(o, "approved")} className={UI.btn}>অনুমোদন</button>
                        <button onClick={() => decideReturn(o, "rejected")} className={UI.btnGhost}>প্রত্যাখ্যান</button>
                      </div>
                    )}
                  </div>
                )}

                {NEXT[o.status].length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {NEXT[o.status].map((n) => (
                      <button key={n} onClick={() => setOrderStatus(o, n)} className={n === "cancelled" || n === "returned" ? UI.btnGhost : UI.btn}>
                        → {STATUS_LABEL[n]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {pagination && pagination.total > pagination.limit && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={UI.btnGhost}>← আগে</button>
          <span className="text-neutral-500">পেজ {page}</span>
          <button disabled={page * pagination.limit >= pagination.total} onClick={() => setPage(page + 1)} className={UI.btnGhost}>পরে →</button>
        </div>
      )}
    </div>
  );
}

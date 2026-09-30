"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/orders-client";
import { formatBDT } from "@/lib/format";

const STEPS = [
  { key: "pending", label: "অর্ডার গৃহীত" },
  { key: "confirmed", label: "কনফার্মড" },
  { key: "shipped", label: "শিপড" },
  { key: "delivered", label: "ডেলিভারড" },
];
const STEP_INDEX = { pending: 0, confirmed: 1, shipped: 2, delivered: 3, returned: 3 };
const RETURN_LABEL = { requested: "রিটার্ন রিকোয়েস্ট জমা — পর্যালোচনায়", approved: "রিটার্ন অনুমোদিত", rejected: "রিটার্ন রিকোয়েস্ট প্রত্যাখ্যাত" };

function Tracker({ order }) {
  if (order.status === "cancelled") return <p className="text-sm font-medium text-red-500">অর্ডারটি বাতিল হয়েছে</p>;
  const current = STEP_INDEX[order.status] ?? 0;
  return (
    <div>
      <ol className="flex items-center">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${i <= current ? "bg-brand text-white" : "bg-neutral-200 text-neutral-500"}`}>{i <= current ? "✓" : i + 1}</div>
              <span className="mt-1 text-[11px] text-neutral-600">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-1 mb-4 h-0.5 flex-1 ${i < current ? "bg-brand" : "bg-neutral-200"}`} />}
          </li>
        ))}
      </ol>
      {order.status === "returned" && <p className="mt-2 text-sm font-medium text-amber-600">অর্ডারটি রিটার্ন করা হয়েছে</p>}
    </div>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  const load = () => ordersApi.mine().then(setOrders).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  async function requestReturn(order) {
    const reason = window.prompt("রিটার্নের কারণ লিখুন:");
    if (!reason?.trim()) return;
    try {
      await ordersApi.requestReturn(order._id, reason.trim());
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (error) return <p className="text-red-500">{error}</p>;
  if (!orders) return <p className="text-neutral-400">লোড হচ্ছে...</p>;
  if (orders.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="mb-3 text-neutral-500">আপনি এখনো কোনো অর্ডার করেননি।</p>
        <Link href="/" className="text-brand hover:underline">কেনাকাটা শুরু করুন →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o._id} className="rounded-xl border border-neutral-200 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div>
              <span className="font-mono text-neutral-500">#{o._id.slice(-8).toUpperCase()}</span>
              <span className="ml-3 text-neutral-400">{new Date(o.createdAt).toLocaleDateString("bn-BD")}</span>
            </div>
            <div className="font-semibold text-neutral-900">{formatBDT(o.total)}</div>
          </div>

          <Tracker order={o} />

          <ul className="mt-4 divide-y divide-neutral-100 text-sm">
            {o.items.map((i, idx) => (
              <li key={idx} className="flex justify-between py-1.5">
                <span className="text-neutral-700">{i.title} × {i.qty}</span>
                <span>{formatBDT(i.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-neutral-500">
              পেমেন্ট: {o.paymentMethod.toUpperCase()} ({o.paymentStatus === "paid" ? "পরিশোধিত" : o.paymentStatus === "failed" ? "ব্যর্থ" : "বাকি"})
            </span>
            {o.returnRequest?.status ? (
              <span className="text-amber-600">{RETURN_LABEL[o.returnRequest.status]}</span>
            ) : (
              o.status === "delivered" && (
                <button onClick={() => requestReturn(o)} className="text-brand hover:underline">রিটার্ন রিকোয়েস্ট করুন</button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { formatBDT } from "@/lib/format";

const STATUS_LABEL = { pending: "অপেক্ষমাণ", confirmed: "কনফার্মড", shipped: "শিপড", delivered: "ডেলিভারড", returned: "রিটার্নড", cancelled: "বাতিল" };
const METHOD_LABEL = { cod: "COD", bkash: "bKash", nagad: "Nagad", card: "কার্ড" };

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminFetch(`/admin/analytics?days=${days}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, [days]);

  const maxRevenue = data ? Math.max(1, ...data.revenueByDay.map((d) => d.revenue)) : 1;
  const totalRevenue = data?.revenueByDay.reduce((s, d) => s + d.revenue, 0) || 0;
  const totalOrders = data?.revenueByDay.reduce((s, d) => s + d.orders, 0) || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">সেলস অ্যানালিটিক্স</h1>
        <select className="rounded-md border border-neutral-300 px-3 py-2 text-sm" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>গত ৭ দিন</option>
          <option value={14}>গত ১৪ দিন</option>
          <option value={30}>গত ৩০ দিন</option>
          <option value={90}>গত ৯০ দিন</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!data && !error && <p className="text-neutral-400">লোড হচ্ছে...</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-xs text-neutral-500">মোট বিক্রি (paid)</div>
              <div className="mt-1 text-2xl font-bold text-brand">{formatBDT(totalRevenue)}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-xs text-neutral-500">অর্ডার (paid)</div>
              <div className="mt-1 text-2xl font-bold text-neutral-900">{totalOrders}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-xs text-neutral-500">গড় অর্ডার মূল্য</div>
              <div className="mt-1 text-2xl font-bold text-neutral-900">{formatBDT(totalOrders ? Math.round(totalRevenue / totalOrders) : 0)}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-xs text-neutral-500">পেমেন্ট মেথড</div>
              <div className="mt-1 space-y-0.5 text-xs text-neutral-600">
                {Object.entries(data.paymentMethodCounts).map(([k, v]) => (
                  <div key={k}>{METHOD_LABEL[k] || k}: {v}</div>
                ))}
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-neutral-800">দৈনিক বিক্রি</h2>
            <div className="flex h-48 items-end gap-1">
              {data.revenueByDay.map((d) => (
                <div key={d.date} className="group relative flex-1">
                  <div
                    className="mx-auto w-full max-w-[24px] rounded-t bg-brand/80 transition-colors group-hover:bg-brand"
                    style={{ height: `${Math.max(2, (d.revenue / maxRevenue) * 100)}%` }}
                  />
                  <div className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-[11px] text-white group-hover:block">
                    {new Date(d.date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}: {formatBDT(d.revenue)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
              <span>{new Date(data.revenueByDay[0].date).toLocaleDateString("bn-BD")}</span>
              <span>{new Date(data.revenueByDay[data.revenueByDay.length - 1].date).toLocaleDateString("bn-BD")}</span>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-neutral-800">অর্ডার স্ট্যাটাস</h2>
              <div className="space-y-2">
                {Object.entries(STATUS_LABEL).map(([key, label]) => {
                  const count = data.statusCounts[key] || 0;
                  const max = Math.max(1, ...Object.values(data.statusCounts));
                  return (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="w-20 shrink-0 text-neutral-600">{label}</span>
                      <div className="h-2 flex-1 rounded-full bg-neutral-100">
                        <div className="h-2 rounded-full bg-brand" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                      <span className="w-8 text-right text-neutral-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-neutral-800">টপ প্রোডাক্ট (বিক্রি অনুযায়ী)</h2>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-neutral-400">এখনো কোনো পেইড অর্ডার নেই।</p>
              ) : (
                <ol className="space-y-2 text-sm">
                  {data.topProducts.map((p, i) => (
                    <li key={p._id} className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1 text-neutral-700">{i + 1}. {p.title}</span>
                      <span className="shrink-0 text-neutral-500">{p.qty} পিস · {formatBDT(p.revenue)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

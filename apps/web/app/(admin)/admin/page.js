"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-api";
import { formatBDT } from "@/lib/format";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminFetch("/admin/stats").then((r) => setStats(r.data)).catch((e) => setError(e.message));
  }, []);

  const cards = stats && [
    { label: "মোট প্রোডাক্ট", value: stats.products, sub: `${stats.published}টি পাবলিশড`, href: "/admin/products" },
    { label: "মোট অর্ডার", value: stats.orders, sub: `${stats.pendingOrders}টি অপেক্ষমাণ`, href: "/admin/orders" },
    { label: "লো-স্টক প্রোডাক্ট", value: stats.lowStock, sub: "৫ বা কম স্টক", href: "/admin/inventory" },
    { label: "ইউজার", value: stats.users, sub: "নিবন্ধিত", href: "/admin/users" },
    { label: "পরিশোধিত বিক্রি", value: formatBDT(stats.revenue), sub: "paid অর্ডার থেকে", href: "/admin/orders" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">ড্যাশবোর্ড</h1>
        <Link href="/admin/products" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          + নতুন প্রোডাক্ট
        </Link>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!stats && !error && <p className="text-neutral-400">লোড হচ্ছে...</p>}
      {cards && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-brand">
              <div className="text-xs text-neutral-500">{c.label}</div>
              <div className="mt-1 text-2xl font-bold text-neutral-900">{c.value}</div>
              <div className="text-xs text-neutral-400">{c.sub}</div>
            </Link>
          ))}
        </div>
      )}
      <Link href="/admin/analytics" className="mt-8 inline-block text-sm text-brand hover:underline">
        বিস্তারিত সেলস অ্যানালিটিক্স দেখুন (চার্ট, টপ প্রোডাক্ট, ট্রেন্ড) →
      </Link>
    </div>
  );
}

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
    <div className="mx-auto max-w-7xl">
      <div className="relative mb-7 overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-[#3a1117] px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8">
        <div aria-hidden="true" className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">Bangal Computer · Admin</p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">ড্যাশবোর্ড</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-300">আপনার স্টোরের পণ্য, অর্ডার এবং বিক্রির সার্বিক অবস্থা এক নজরে দেখুন।</p>
          </div>
          <Link href="/admin/products" className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark">
            <span aria-hidden="true">+</span> নতুন প্রোডাক্ট যোগ করুন
          </Link>
        </div>
      </div>

      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-neutral-900">স্টোরের সারাংশ</h2>
          <p className="mt-1 text-xs text-neutral-500">বর্তমান ক্যাটালগ ও অর্ডারের পরিসংখ্যান</p>
        </div>
        <span className="hidden rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 sm:inline-flex">লাইভ ডেটা</span>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!stats && !error && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl border border-neutral-200 bg-white" />)}
        </div>
      )}
      {cards && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-semibold leading-5 text-neutral-500">{c.label}</div>
                <span className="text-sm text-neutral-300 transition-colors group-hover:text-brand" aria-hidden="true">↗</span>
              </div>
              <div className="mt-3 break-words text-xl font-extrabold text-neutral-950 sm:text-2xl">{c.value}</div>
              <div className="mt-1 text-xs leading-5 text-neutral-400">{c.sub}</div>
            </Link>
          ))}
        </div>
      )}

      <section className="mt-7 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-extrabold text-neutral-900">দ্রুত কাজ</h2>
            <p className="mt-1 text-sm text-neutral-500">প্রয়োজনীয় পরিচালনা টুলে সরাসরি যান।</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/orders" className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-brand hover:text-brand">অর্ডার দেখুন →</Link>
            <Link href="/admin/analytics" className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-brand hover:text-brand">সেলস অ্যানালিটিক্স →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

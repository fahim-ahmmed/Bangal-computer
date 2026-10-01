"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, authClient } from "@/lib/auth-client";
import { accountApi } from "@/lib/orders-client";

export default function AccountOverviewPage() {
  const { data: session } = useSession();
  const [me, setMe] = useState(null);

  useEffect(() => {
    accountApi.me().then(setMe).catch(() => setMe(null));
  }, []);

  const user = session?.user;
  const isStaff = ["admin", "staff"].includes(user?.role);
  const displayName = user?.name || user?.email || "গ্রাহক";
  const initials = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-xl font-extrabold text-brand">
            {initials}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">আপনার ড্যাশবোর্ড</p>
            <h1 className="mt-1 text-xl font-extrabold text-neutral-950 sm:text-2xl">স্বাগতম, {displayName}</h1>
            <p className="mt-1 text-sm text-neutral-500">{user?.email}{me?.phone ? ` · ${me.phone}` : ""}</p>
          </div>
        </div>
        <button
          onClick={() => authClient.signOut().then(() => (window.location.href = "/"))}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5m5 5H3m9-9h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
          </svg>
          লগআউট
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 14.8 8.7l6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
            </svg>
          </span>
          <div className="mt-4 text-xs font-semibold text-neutral-500">লয়্যালটি পয়েন্টস</div>
          <div className="mt-1 text-3xl font-extrabold text-brand">{me?.points ?? 0}</div>
          <div className="mt-2 text-xs leading-5 text-neutral-500">প্রতি ৳১০০ কেনাকাটায় ১ পয়েন্ট, অর্ডার ডেলিভারড হলে জমা হয়</div>
        </div>
        <Link href="/account/orders" className="group rounded-2xl border border-neutral-200 p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-600 transition-colors group-hover:bg-red-50 group-hover:text-brand">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M9 13h6m-6 4h6" />
            </svg>
          </span>
          <div className="mt-4 font-bold text-neutral-900">আমার অর্ডার</div>
          <div className="mt-1 text-sm leading-6 text-neutral-500">অর্ডার হিস্ট্রি, ট্র্যাকিং ও রিটার্ন রিকোয়েস্ট</div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand">অর্ডার দেখুন <span aria-hidden="true">→</span></span>
        </Link>
        <Link href="/account/addresses" className="group rounded-2xl border border-neutral-200 p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-600 transition-colors group-hover:bg-red-50 group-hover:text-brand">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <div className="mt-4 font-bold text-neutral-900">ঠিকানা বই</div>
          <div className="mt-1 text-sm leading-6 text-neutral-500">ডেলিভারি ঠিকানা সংরক্ষণ ও সম্পাদনা করুন</div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand">ঠিকানা পরিচালনা <span aria-hidden="true">→</span></span>
        </Link>
      </div>

      {isStaff && (
        <Link href="/admin" className="inline-flex rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700">
          অ্যাডমিন প্যানেলে যান →
        </Link>
      )}
    </div>
  );
}

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">স্বাগতম, {user?.name || user?.email}</h1>
        <p className="text-sm text-neutral-500">{user?.email}{me?.phone ? ` · ${me.phone}` : ""}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 p-5">
          <div className="text-xs text-neutral-500">লয়্যালটি পয়েন্টস</div>
          <div className="mt-1 text-3xl font-bold text-brand">{me?.points ?? 0}</div>
          <div className="mt-1 text-xs text-neutral-400">প্রতি ৳১০০ কেনাকাটায় ১ পয়েন্ট, অর্ডার ডেলিভারড হলে জমা হয়</div>
        </div>
        <Link href="/account/orders" className="rounded-xl border border-neutral-200 p-5 hover:border-brand">
          <div className="font-semibold text-neutral-800">আমার অর্ডার</div>
          <div className="mt-1 text-sm text-neutral-500">হিস্ট্রি, ট্র্যাকিং ও রিটার্ন রিকোয়েস্ট</div>
        </Link>
        <Link href="/account/addresses" className="rounded-xl border border-neutral-200 p-5 hover:border-brand">
          <div className="font-semibold text-neutral-800">ঠিকানা বই</div>
          <div className="mt-1 text-sm text-neutral-500">ডেলিভারি ঠিকানা সেভ ও এডিট</div>
        </Link>
      </div>

      {isStaff && (
        <Link href="/admin" className="inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700">
          অ্যাডমিন প্যানেলে যান →
        </Link>
      )}

      <div>
        <button onClick={() => authClient.signOut().then(() => (window.location.href = "/"))} className="text-sm text-red-500 hover:underline">
          লগআউট
        </button>
      </div>
    </div>
  );
}

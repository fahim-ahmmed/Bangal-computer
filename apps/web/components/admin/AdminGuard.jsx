"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/** Only admin/staff may see the admin panel (the API enforces this again on every request). */
export default function AdminGuard({ children }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children;
  }

  if (isPending) {
    return <div className="p-16 text-center text-neutral-400">লোড হচ্ছে...</div>;
  }

  if (!session?.user) {
    return (
      <div className="min-h-[65vh] bg-[#f5f6f7] px-4 py-14">
        <section className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <h1 className="text-2xl font-extrabold text-neutral-950">অ্যাডমিন প্যানেলে প্রবেশ</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">অ্যাডমিন বা স্টাফ অ্যাকাউন্ট দিয়ে লগইন করলে প্যানেল ব্যবহার করতে পারবেন।</p>
          <Link href="/admin/login" className="mt-5 inline-flex rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">
            লগইন করুন →
          </Link>
          <p className="mt-5 text-xs text-neutral-400">অ্যাকাউন্ট না থাকলে আগে সাইন আপ করুন, তারপর অ্যাডমিন অ্যাক্সেস দিন।</p>
        </section>
      </div>
    );
  }

  if (!["admin", "staff"].includes(session.user.role)) {
    return (
      <div className="min-h-[65vh] bg-[#f5f6f7] px-4 py-14">
        <section className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">অ্যাক্সেস সীমাবদ্ধ</p>
          <h1 className="mt-2 text-2xl font-extrabold text-neutral-950">এই অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            অ্যাডমিন প্যানেলে যেতে admin বা staff role প্রয়োজন। আপনার অ্যাকাউন্টটি অ্যাডমিন হিসেবে অনুমোদিত হলে লগআউট করে আবার লগইন করুন।
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/account" className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:border-brand hover:text-brand">অ্যাকাউন্টে ফিরুন</Link>
            <Link href="/" className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700">হোমে ফিরুন</Link>
          </div>
        </section>
      </div>
    );
  }

  return children;
}

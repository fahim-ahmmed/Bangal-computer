"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const TABS = [
  { href: "/account", label: "ওভারভিউ" },
  { href: "/account/orders", label: "আমার অর্ডার" },
  { href: "/account/addresses", label: "ঠিকানা" },
  { href: "/wishlist", label: "উইশলিস্ট" },
];

export default function AccountLayout({ children }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  if (isPending) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4">
        <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
          <p className="mt-4 text-sm font-medium text-neutral-500">আপনার অ্যাকাউন্ট লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-[55vh] bg-[#f5f6f7] px-4 py-10 sm:py-16">
        <section className="mx-auto max-w-xl rounded-3xl border border-neutral-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-brand">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="8" r="3.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand">Bangal Computer</p>
          <h1 className="mt-2 text-2xl font-extrabold text-neutral-950">আপনার অ্যাকাউন্টে প্রবেশ করুন</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
            অর্ডার ট্র্যাক, ঠিকানা পরিচালনা ও লয়্যালটি পয়েন্ট দেখতে লগইন করুন।
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark">
              লগইন করুন
            </Link>
            <Link href="/signup" className="rounded-lg border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition-colors hover:border-brand hover:text-brand">
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[55vh] bg-[#f5f6f7]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <nav aria-label="অ্যাকাউন্ট নেভিগেশন" className="mb-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-1">
            {TABS.map((t) => {
              const active = t.href === "/account" ? pathname === "/account" : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-brand text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-50 hover:text-brand"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}

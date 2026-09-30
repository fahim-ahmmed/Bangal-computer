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
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-neutral-400">লোড হচ্ছে...</div>;
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="mb-4 text-neutral-500">অ্যাকাউন্ট দেখতে লগইন করুন।</p>
        <Link href="/login" className="text-brand hover:underline">লগইন করুন →</Link>
        <span className="mx-2 text-neutral-300">|</span>
        <Link href="/signup" className="text-brand hover:underline">নতুন অ্যাকাউন্ট খুলুন →</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-neutral-200">
        {TABS.map((t) => {
          const active = t.href === "/account" ? pathname === "/account" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${active ? "border-brand text-brand" : "border-transparent text-neutral-600 hover:text-brand"}`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}

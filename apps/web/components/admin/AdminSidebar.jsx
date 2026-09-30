"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "ড্যাশবোর্ড" },
  { href: "/admin/analytics", label: "অ্যানালিটিক্স" },
  { href: "/admin/products", label: "প্রোডাক্ট" },
  { href: "/admin/orders", label: "অর্ডার" },
  { href: "/admin/inventory", label: "ইনভেন্টরি" },
  { href: "/admin/categories", label: "ক্যাটাগরি ও ব্র্যান্ড" },
  { href: "/admin/coupons", label: "কুপন" },
  { href: "/admin/users", label: "ইউজার ও রোল" },
  { href: "/admin/tools", label: "Extra Tools" },
  { href: "/admin/cms", label: "হোমপেজ CMS" },
  { href: "/admin/blog", label: "ব্লগ" },
  { href: "/admin/branches", label: "ব্রাঞ্চ" },
  { href: "/admin/messages", label: "মেসেজ" },
  { href: "/admin/chat", label: "লাইভ চ্যাট" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white p-4">
      <Link href="/" className="mb-6 block text-lg font-bold text-brand">
        Bangal Computer
      </Link>
      <nav className="space-y-1">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                active ? "bg-brand/10 text-brand" : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

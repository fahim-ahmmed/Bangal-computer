"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "ড্যাশবোর্ড", group: "ওভারভিউ" },
  { href: "/admin/analytics", label: "অ্যানালিটিক্স", group: "ওভারভিউ" },
  { href: "/admin/products", label: "প্রোডাক্ট", group: "ক্যাটালগ" },
  { href: "/admin/categories", label: "ক্যাটাগরি ও ব্র্যান্ড", group: "ক্যাটালগ" },
  { href: "/admin/inventory", label: "ইনভেন্টরি", group: "ক্যাটালগ" },
  { href: "/admin/orders", label: "অর্ডার", group: "বিক্রয়" },
  { href: "/admin/coupons", label: "কুপন", group: "বিক্রয়" },
  { href: "/admin/users", label: "ইউজার ও রোল", group: "পরিচালনা" },
  { href: "/admin/messages", label: "মেসেজ", group: "পরিচালনা" },
  { href: "/admin/chat", label: "লাইভ চ্যাট", group: "পরিচালনা" },
  { href: "/admin/cms", label: "হোমপেজ CMS", group: "কনটেন্ট" },
  { href: "/admin/blog", label: "ব্লগ", group: "কনটেন্ট" },
  { href: "/admin/branches", label: "ব্রাঞ্চ", group: "কনটেন্ট" },
  { href: "/admin/tools", label: "Extra Tools", group: "কনটেন্ট" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const linkClass = (item) => {
    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
    return `block whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
      active ? "bg-brand text-white shadow-sm" : "text-neutral-300 hover:bg-white/10 hover:text-white"
    }`;
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-800 bg-[#171719] px-4 py-5 text-white lg:flex">
        <Link href="/" className="mb-7 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-lg font-extrabold">B</span>
          <span>
            <span className="block text-sm font-extrabold tracking-wide">Bangal Computer</span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Admin workspace</span>
          </span>
        </Link>
        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto">
          {["ওভারভিউ", "ক্যাটালগ", "বিক্রয়", "পরিচালনা", "কনটেন্ট"].map((group) => (
            <div key={group}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{group}</p>
              <div className="space-y-0.5">
                {NAV.filter((item) => item.group === group).map((item) => (
                  <Link key={item.href} href={item.href} aria-current={linkClass(item).includes("bg-brand ") ? "page" : undefined} className={linkClass(item)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <Link href="/" className="mt-5 rounded-lg border border-neutral-700 px-3 py-2.5 text-center text-xs font-semibold text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white">
          ← স্টোরফ্রন্টে ফিরুন
        </Link>
      </aside>

      <div className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">B</span>
            Admin workspace
          </Link>
          <Link href="/" className="text-xs font-semibold text-neutral-500 hover:text-brand">স্টোরফ্রন্ট</Link>
        </div>
        <nav aria-label="অ্যাডমিন নেভিগেশন" className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={linkClass(item).includes("bg-brand ") ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${item.href === "/admin" ? (pathname === "/admin" ? "bg-brand text-white" : "bg-neutral-100 text-neutral-600") : (pathname.startsWith(item.href) ? "bg-brand text-white" : "bg-neutral-100 text-neutral-600")}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

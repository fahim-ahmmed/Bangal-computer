"use client";

import { useEffect, useRef, useState } from "react";
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

const GROUPS = ["ওভারভিউ", "ক্যাটালগ", "বিক্রয়", "পরিচালনা", "কনটেন্ট"];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isActive = (item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

  const current = NAV.find(isActive);

  // পেজ বদলালে ড্রপডাউন বন্ধ
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // বাইরে ট্যাপ করলে বা Esc চাপলে বন্ধ
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const linkClass = (item) =>
    `block whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive(item)
        ? "bg-brand text-white shadow-sm"
        : "text-neutral-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <>
      {/* ডেস্কটপ সাইডবার */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-800 bg-[#171719] px-4 py-5 text-white lg:flex">
        <Link href="/" className="mb-7 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-lg font-extrabold">B</span>
          <span>
            <span className="block text-sm font-extrabold tracking-wide">Bangal Computer</span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Admin workspace</span>
          </span>
        </Link>
        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{group}</p>
              <div className="space-y-0.5">
                {NAV.filter((item) => item.group === group).map((item) => (
                  <Link key={item.href} href={item.href} aria-current={isActive(item) ? "page" : undefined} className={linkClass(item)}>
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

      {/* মোবাইল: ড্রপডাউন মেনু */}
      <div className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">B</span>
            Admin workspace
          </Link>
          <Link href="/" className="text-xs font-semibold text-neutral-500 hover:text-brand">স্টোরফ্রন্ট</Link>
        </div>

        <div ref={menuRef} className="relative px-3 pb-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="অ্যাডমিন মেনু"
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-900 transition-colors hover:border-brand"
          >
            <span className="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {current?.label || "মেনু"}
            </span>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {open && (
            <nav
              role="menu"
              aria-label="অ্যাডমিন নেভিগেশন"
              className="absolute inset-x-3 top-full z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-xl shadow-neutral-900/10"
            >
              {GROUPS.map((group) => (
                <div key={group} className="mb-1.5 last:mb-0">
                  <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">{group}</p>
                  {NAV.filter((item) => item.group === group).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      aria-current={isActive(item) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive(item)
                          ? "bg-brand text-white"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
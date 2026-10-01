"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * StarTech-style mega menu:
 *  - Row of Main Categories along the top bar.
 *  - Hovering a Main Category opens a panel listing its Subcategories
 *    down the left; each subcategory's Brand list (if any) sits to its
 *    right in the same row, wrapped as a chip group so long brand
 *    lists (e.g. Keyboard = 28 brands) don't blow out the layout.
 *  - "সব দেখুন" (Show All) link jumps to the plain category page.
 *
 * `tree` is the array returned by GET /api/categories:
 *   [{ _id, name, slug, subcategories: [{ _id, name, slug, brands: [...] }] }]
 */
export default function MegaMenu({ tree }) {
  const [openId, setOpenId] = useState(null);

  if (!tree || tree.length === 0) return null;
  const openMain = tree.find((main) => main._id === openId);

  return (
    <div
      className="relative border-t border-neutral-800 bg-neutral-900"
      onMouseLeave={() => setOpenId(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpenId(null);
      }}
    >
      <nav aria-label="প্রোডাক্ট ক্যাটাগরি" className="mx-auto max-w-7xl px-4">
        <ul className="flex items-center gap-1 overflow-x-auto text-[13px] font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tree.map((main) => (
            <li key={main._id} className="shrink-0">
              <Link
                href={`/${main.slug}`}
                onMouseEnter={() => setOpenId(main._id)}
                onFocus={() => setOpenId(main._id)}
                aria-expanded={openId === main._id}
                aria-controls="category-mega-panel"
                className={`group relative block whitespace-nowrap rounded-t-lg px-3.5 py-3.5 transition-colors duration-200 after:absolute after:inset-x-3.5 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:rounded-full after:bg-red-400 after:transition-transform after:duration-200 hover:bg-white/10 hover:text-white hover:after:scale-x-100 focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none focus-visible:after:scale-x-100 ${
                  openId === main._id ? "bg-white/10 text-white after:scale-x-100" : "text-neutral-300"
                }`}
              >
                {main.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {openMain?.subcategories?.length > 0 && (
        <div
          id="category-mega-panel"
          className="menu-panel absolute left-0 right-0 top-full z-50 border-y border-neutral-200 bg-white shadow-[0_18px_45px_-20px_rgba(15,23,42,0.35)]"
          onMouseEnter={() => setOpenId(openMain._id)}
        >
          <div className="mx-auto max-h-[min(70vh,640px)] max-w-7xl overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">ক্যাটাগরি ব্রাউজ করুন</p>
                <h2 className="mt-1 text-xl font-bold text-neutral-950">{openMain.name}</h2>
              </div>
              <Link
                href={`/${openMain.slug}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-bold text-brand transition-colors hover:bg-red-100"
              >
                সব দেখুন <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {openMain.subcategories.map((sub) => (
                <li key={sub._id} className="group/sub min-w-0 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">
                  <Link href={`/${openMain.slug}/${sub.slug}`} className="flex items-center justify-between gap-2 text-sm font-bold text-neutral-900 transition-colors group-hover/sub:text-brand">
                    <span className="truncate">{sub.name}</span>
                    <span className="shrink-0 text-neutral-300 transition-transform group-hover/sub:translate-x-0.5 group-hover/sub:text-brand" aria-hidden="true">→</span>
                  </Link>
                  {sub.brands?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3">
                      {sub.brands.map((brand) => (
                        <Link
                          key={brand.slug}
                          href={`/${openMain.slug}/${sub.slug}/${brand.slug}`}
                          className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-red-50 hover:text-brand"
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

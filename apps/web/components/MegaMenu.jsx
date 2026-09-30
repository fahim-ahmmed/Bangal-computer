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
      className="relative border-t border-neutral-200 bg-white"
      onMouseLeave={() => setOpenId(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpenId(null);
      }}
    >
      <nav className="mx-auto max-w-7xl px-4">
        <ul className="flex items-center gap-1 overflow-x-auto text-sm font-medium [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tree.map((main) => (
            <li key={main._id} className="shrink-0">
              <Link
                href={`/${main.slug}`}
                onMouseEnter={() => setOpenId(main._id)}
                onFocus={() => setOpenId(main._id)}
                aria-expanded={openId === main._id}
                aria-controls="category-mega-panel"
                className={`group relative block whitespace-nowrap px-3 py-3 transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-200 hover:text-brand hover:after:scale-x-100 focus-visible:text-brand focus-visible:outline-none focus-visible:after:scale-x-100 ${
                  openId === main._id ? "text-brand after:scale-x-100" : "text-neutral-700"
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
          className="menu-panel absolute left-0 right-0 top-full z-50 border-y border-neutral-200 bg-white shadow-xl"
          onMouseEnter={() => setOpenId(openMain._id)}
        >
          <div className="mx-auto max-h-[70vh] max-w-7xl overflow-y-auto px-4 py-5">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-950">{openMain.name}</h2>
              <Link href={`/${openMain.slug}`} className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark">
                সব দেখুন <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-x-7 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {openMain.subcategories.map((sub) => (
                <li key={sub._id} className="min-w-0 border-b border-neutral-100 pb-3">
                  <Link
                    href={`/${openMain.slug}/${sub.slug}`}
                    className="text-sm font-semibold text-neutral-900 transition-colors hover:text-brand"
                  >
                    {sub.name}
                  </Link>
                  {sub.brands?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                      {sub.brands.map((brand) => (
                        <Link
                          key={brand.slug}
                          href={`/${openMain.slug}/${sub.slug}/${brand.slug}`}
                          className="text-xs text-neutral-500 transition-colors hover:text-brand hover:underline"
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

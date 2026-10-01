"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatBDT } from "@/lib/format";

export default function ProductFilters({ basePath, facets }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const selectedBrands = (searchParams.get("brand") || "").split(",").filter(Boolean);

  function updateParams(next) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    });
    params.delete("page"); // reset pagination on any filter change
    router.push(`${basePath}?${params.toString()}`);
  }

  function toggleBrand(slug) {
    const set = new Set(selectedBrands);
    set.has(slug) ? set.delete(slug) : set.add(slug);
    updateParams({ brand: [...set].join(",") });
  }

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-52">
        <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">ফিল্টার</h2>
            <p className="mt-0.5 text-xs text-neutral-500">পছন্দমতো পণ্য খুঁজুন</p>
          </div>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-brand" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M7 12h10m-7 5h4" />
          </svg>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold text-neutral-800">দাম</h3>
          {facets?.price && (
            <p className="mb-2 text-xs text-neutral-500">
              {formatBDT(facets.price.min)} – {formatBDT(facets.price.max)}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="সর্বনিম্ন"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
            />
            <span className="text-neutral-400">–</span>
            <input
              type="number"
              min="0"
              placeholder="সর্বোচ্চ"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
            />
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-brand px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => updateParams({ minPrice, maxPrice })}
          >
            দাম দিয়ে খুঁজুন
          </button>
        </div>

        {facets?.brands?.length > 0 && (
          <div className="mt-5 border-t border-neutral-100 pt-4">
            <h3 className="mb-3 text-sm font-bold text-neutral-800">ব্র্যান্ড</h3>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {facets.brands.map((b) => (
                <label key={b.slug} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.slug)}
                    onChange={() => toggleBrand(b.slug)}
                    className="h-4 w-4 rounded border-neutral-300 accent-red-600"
                  />
                  <span className="min-w-0 flex-1 truncate">{b.name}</span>
                  <span className="text-xs text-neutral-400">{b.count}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {(searchParams.get("minPrice") || searchParams.get("maxPrice") || searchParams.get("brand")) && (
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="mt-4 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:border-brand hover:text-brand"
          >
            সব ফিল্টার মুছুন
          </button>
        )}
      </div>
    </aside>
  );
}

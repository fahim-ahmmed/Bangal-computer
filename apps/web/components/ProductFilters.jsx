"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@heroui/react";
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
    <aside className="w-full md:w-64 shrink-0 space-y-6">
      <div>
        <h3 className="font-semibold text-neutral-800 mb-2">দাম</h3>
        {facets?.price && (
          <p className="text-xs text-neutral-400 mb-2">
            {formatBDT(facets.price.min)} – {formatBDT(facets.price.max)}
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="সর্বনিম্ন"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
          <span className="text-neutral-400">–</span>
          <input
            type="number"
            placeholder="সর্বোচ্চ"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
        <Button
          size="sm"
          className="mt-2 w-full"
          color="danger"
          radius="sm"
          onClick={() => updateParams({ minPrice, maxPrice })}
        >
          ফিল্টার করুন
        </Button>
      </div>

      {facets?.brands?.length > 0 && (
        <div>
          <h3 className="font-semibold text-neutral-800 mb-2">ব্র্যান্ড</h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {facets.brands.map((b) => (
              <label key={b.slug} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b.slug)}
                  onChange={() => toggleBrand(b.slug)}
                  className="rounded border-neutral-300"
                />
                {b.name} <span className="text-neutral-400">({b.count})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {(searchParams.get("minPrice") || searchParams.get("maxPrice") || searchParams.get("brand")) && (
        <button
          onClick={() => router.push(basePath)}
          className="text-sm text-brand hover:underline"
        >
          সব ফিল্টার মুছুন
        </button>
      )}
    </aside>
  );
}

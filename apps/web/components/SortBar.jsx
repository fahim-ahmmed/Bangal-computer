"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "নতুন আগে" },
  { value: "price_asc", label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "featured", label: "ফিচার্ড আগে" },
];

export default function SortBar({ basePath, total }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "newest";

  function onChange(e) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-neutral-500">{total ?? 0}টি প্রোডাক্ট পাওয়া গেছে</span>
      <select
        value={current}
        onChange={onChange}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

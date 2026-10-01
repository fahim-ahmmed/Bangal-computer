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
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold text-neutral-900">প্রোডাক্ট তালিকা</p>
        <span className="mt-0.5 block text-xs text-neutral-500">{total ?? 0}টি প্রোডাক্ট পাওয়া গেছে</span>
      </div>
      <select
        value={current}
        onChange={onChange}
        aria-label="প্রোডাক্ট সাজান"
        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 sm:w-auto"
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

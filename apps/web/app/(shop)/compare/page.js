"use client";

import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { formatBDT } from "@/lib/format";

export default function ComparePage() {
  const { items, toggle, clear } = useCompare();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">তুলনা করার জন্য এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</p>
        <Link href="/" className="text-brand hover:underline">
          প্রোডাক্ট ব্রাউজ করুন →
        </Link>
      </div>
    );
  }

  const allSpecKeys = [...new Set(items.flatMap((p) => Object.keys(p.specs || {})))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">প্রোডাক্ট তুলনা ({items.length}/4)</h1>
        <button onClick={clear} className="text-sm text-neutral-400 hover:text-red-500">
          সব মুছুন
        </button>
      </div>

      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-40" />
            {items.map((p) => (
              <th key={p._id} className="p-3 align-top text-left border-b border-neutral-200">
                <div className="w-40">
                  <div className="aspect-square bg-neutral-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.title} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-neutral-300">ছবি নেই</span>
                    )}
                  </div>
                  <Link href={`/product/${p.slug}`} className="font-medium text-neutral-800 hover:text-brand line-clamp-2">
                    {p.title}
                  </Link>
                  <div className="text-brand font-bold mt-1">{formatBDT(p.discountPrice || p.price)}</div>
                  <button onClick={() => toggle(p)} className="mt-2 text-xs text-neutral-400 hover:text-red-500">
                    বাদ দিন
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allSpecKeys.map((key, i) => (
            <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
              <td className="p-3 font-medium text-neutral-600 border-b border-neutral-100">{key}</td>
              {items.map((p) => (
                <td key={p._id} className="p-3 text-neutral-800 border-b border-neutral-100">
                  {p.specs?.[key] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

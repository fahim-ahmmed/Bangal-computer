"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@heroui/react";
import { formatBDT } from "@/lib/format";
import { getApiBaseUrl } from "@/lib/deployment-config";

const API_URL = getApiBaseUrl();

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const router = useRouter();

  const fetchSuggestions = useCallback((query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    fetch(`${API_URL}/products/search/suggest?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((json) => setSuggestions(json.data || []))
      .catch(() => setSuggestions([]));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 300);
    return () => clearTimeout(debounceRef.current);
  }, [q, fetchSuggestions]);

  function goToSearch(e) {
    e?.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className="relative w-full">
      <form onSubmit={goToSearch} className="flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
        <Input
          value={q}
          onValueChange={(v) => {
            setQ(v);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="প্রোডাক্ট খুঁজুন..."
          radius="none"
          classNames={{
            base: "flex-1",
            inputWrapper: "h-12 rounded-none border-0 bg-transparent px-4 shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
            input: "text-sm placeholder:text-neutral-400",
          }}
        />
        <button
          type="submit"
          aria-label="খুঁজুন"
          className="mr-1.5 inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path strokeLinecap="round" d="m16 16 4.5 4.5" />
          </svg>
          <span className="hidden sm:inline">খুঁজুন</span>
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-neutral-200 bg-white shadow-xl max-h-96 overflow-y-auto">
          {suggestions.map((p) => (
            <Link
              key={p._id}
              href={`/product/${p.slug}`}
              className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50"
              onClick={() => setOpen(false)}
            >
              <div className="h-10 w-10 shrink-0 rounded bg-neutral-100 flex items-center justify-center overflow-hidden">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.title} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-neutral-300">নেই</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-neutral-800 truncate">{p.title}</div>
                <div className="text-xs text-brand font-semibold">
                  {formatBDT(p.discountPrice || p.price)}
                </div>
              </div>
            </Link>
          ))}
          <button
            onClick={goToSearch}
            className="w-full border-t border-neutral-100 px-3 py-2 text-sm text-brand hover:bg-neutral-50 text-left"
          >
            &quot;{q}&quot;-এর জন্য সব ফলাফল দেখুন →
          </button>
        </div>
      )}
    </div>
  );
}

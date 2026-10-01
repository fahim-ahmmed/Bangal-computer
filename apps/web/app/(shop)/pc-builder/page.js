"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { builderApi } from "@/lib/tools-client";
import { formatBDT } from "@/lib/format";
import { useCart } from "@/context/CartContext";

const STORAGE_KEY = "bangal-pc-builder";
const priceOf = (product) => product.discountPrice ?? product.price;

function ProductImage({ product }) {
  return product.images?.[0] ? (
    <Image src={product.images[0]} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, 33vw" className="object-contain p-2" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xs font-medium text-neutral-400">ছবি নেই</div>
  );
}

export default function PcBuilderPage() {
  const [slots, setSlots] = useState([]);
  const [productsBySlot, setProductsBySlot] = useState({});
  const [productErrors, setProductErrors] = useState({});
  const [selections, setSelections] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeSlot, setActiveSlot] = useState(null);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [sort, setSort] = useState("popular");
  const [inStockOnly, setInStockOnly] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const slotData = await builderApi.slots();
        if (!active) return;
        setSlots(slotData);

        const saved = new URLSearchParams(window.location.search).get("build");
        const stored = saved || window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) setSelections(parsed);
          } catch (parseError) {
            if (saved) throw new Error("শেয়ার করা বিল্ডের তথ্য পড়া যায়নি");
            window.localStorage.removeItem(STORAGE_KEY);
          }
        }

        const productResults = await Promise.all(
          slotData.map(async (slot) => {
            try {
              return [slot.key, await builderApi.slotProducts(slot.key), null];
            } catch (loadError) {
              return [slot.key, [], loadError.message || "পণ্য লোড করা যায়নি"];
            }
          })
        );
        if (!active) return;
        setProductsBySlot(Object.fromEntries(productResults.map(([key, items]) => [key, items])));
        setProductErrors(Object.fromEntries(productResults.filter(([, , loadError]) => loadError).map(([key, , loadError]) => [key, loadError])));
      } catch (loadError) {
        if (active) setError(loadError.message || "PC Builder লোড করা যায়নি");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loading) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
  }, [loading, selections]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!activeSlot) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setActiveSlot(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeSlot]);

  const groups = useMemo(
    () => [...new Set(slots.map((slot) => slot.group || "মূল কম্পোনেন্ট"))],
    [slots]
  );
  const requiredSlots = slots.filter((slot) => slot.required);
  const selectedCount = Object.keys(selections).filter((key) => selections[key]).length;
  const completedRequired = requiredSlots.filter((slot) => selections[slot.key]).length;
  const totalPrice = slots.reduce((total, slot) => {
    const product = (productsBySlot[slot.key] || []).find((item) => item._id === selections[slot.key]);
    return total + (product ? Number(priceOf(product)) || 0 : 0);
  }, 0);
  const unmapped = slots.filter((slot) => !slot.subcategoryId && !slot.subcategoryIds?.length);

  const select = useCallback((key, productId) => {
    setSelections((current) => {
      const next = { ...current };
      if (productId) next[key] = productId;
      else delete next[key];
      return next;
    });
    setResult(null);
    setError("");
    setActiveSlot(null);
  }, []);

  async function checkCompatibility() {
    setChecking(true);
    setError("");
    setResult(null);
    try {
      setResult(await builderApi.check(selections));
    } catch (checkError) {
      setError(checkError.message || "কম্প্যাটিবিলিটি যাচাই করা যায়নি");
    } finally {
      setChecking(false);
    }
  }

  async function addBuildToCart() {
    setAdding(true);
    setError("");
    try {
      for (const slot of slots) {
        const productId = selections[slot.key];
        if (productId) await addItem(productId);
      }
      setNotice("আপনার বিল্ডের সব পণ্য কার্টে যোগ হয়েছে");
    } catch (cartError) {
      setError(cartError.message || "কার্টে পণ্য যোগ করা যায়নি");
    } finally {
      setAdding(false);
    }
  }

  async function shareBuild() {
    const url = new URL(window.location.href);
    url.searchParams.set("build", JSON.stringify(selections));
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("শেয়ার লিংক কপি হয়েছে");
    } catch {
      setError("লিংক কপি করা যায়নি। ব্রাউজারের ঠিকানা বার থেকে লিংক কপি করুন।");
    }
  }

  function clearBuild() {
    setSelections({});
    setResult(null);
    setError("");
    setNotice("বিল্ড খালি করা হয়েছে");
    const url = new URL(window.location.href);
    url.searchParams.delete("build");
    window.history.replaceState({}, "", url);
  }

  const activeProducts = activeSlot ? productsBySlot[activeSlot.key] || [] : [];
  const brands = [...new Map(activeProducts.filter((product) => product.brandId?.name).map((product) => [product.brandId.name, product.brandId.name])).keys()].sort();
  const visibleProducts = activeProducts
    .filter((product) => product.title.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((product) => !brandFilter || product.brandId?.name === brandFilter)
    .filter((product) => !inStockOnly || product.stock > 0)
    .sort((a, b) => {
      if (sort === "price-low") return priceOf(a) - priceOf(b);
      if (sort === "price-high") return priceOf(b) - priceOf(a);
      return Number(b.stock > 0) - Number(a.stock > 0);
    });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-brand p-6 text-white shadow-lg sm:p-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Bangal Computer</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">আপনার পিসি নিজেই তৈরি করুন</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              পছন্দের কম্পোনেন্ট বাছুন, দাম দেখুন এবং কেনার আগে সম্ভাব্য কম্প্যাটিবিলিটি যাচাই করুন।
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
              <div className="text-2xl font-bold">{completedRequired}<span className="text-base font-medium text-white/60">/{requiredSlots.length}</span></div>
              <div className="mt-1 text-xs text-white/70">আবশ্যিক অংশ</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
              <div className="text-xl font-bold">{formatBDT(totalPrice) || "৳0"}</div>
              <div className="mt-1 text-xs text-white/70">আনুমানিক মোট</div>
            </div>
          </div>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${requiredSlots.length ? (completedRequired / requiredSlots.length) * 100 : 0}%` }} />
        </div>
      </div>

      {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}
      {unmapped.length > 0 && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {unmapped.map((slot) => slot.label).join(", ")} বিভাগটি অ্যাডমিন প্যানেলের Extra Tools থেকে ক্যাটাগরির সাথে যুক্ত করতে হবে।
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">PC Builder প্রস্তুত হচ্ছে...</div>
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">কম্পোনেন্ট স্লট লোড করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।</div>
      ) : (
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-7">
            {groups.map((group) => (
              <section key={group} aria-labelledby={`group-${group}`} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-4">
                  <h2 id={`group-${group}`} className="font-bold text-neutral-900">{group}</h2>
                </div>
                <div className="divide-y divide-neutral-100">
                  {slots.filter((slot) => (slot.group || "মূল কম্পোনেন্ট") === group).map((slot) => {
                    const products = productsBySlot[slot.key] || [];
                    const selected = products.find((product) => product._id === selections[slot.key]);
                    const mapped = slot.subcategoryId || slot.subcategoryIds?.length;
                    return (
                      <article key={slot.key} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${selected ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                            {selected ? "✓" : String(slot.order + 1).padStart(2, "0")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-neutral-900">{slot.label}</h3>
                              {slot.required && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">আবশ্যিক</span>}
                              {!slot.required && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">ঐচ্ছিক</span>}
                            </div>
                            {selected ? (
                              <p className="mt-1 truncate text-sm text-neutral-600">{selected.title}</p>
                            ) : (
                              <p className="mt-1 text-sm text-neutral-400">
                                {!mapped ? "ক্যাটাগরি যুক্ত করা হয়নি" : productErrors[slot.key] || (products.length ? `${products.length}টি পণ্য থেকে বাছুন` : "এখনও প্রকাশিত পণ্য নেই")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                          {selected && <strong className="text-sm font-bold text-neutral-900">{formatBDT(priceOf(selected))}</strong>}
                          {selected && (
                            <button type="button" onClick={() => select(slot.key, "")} className="rounded-lg px-2 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100" aria-label={`${slot.label} সরান`}>
                              সরান
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => { setActiveSlot(slot); setSearch(""); setBrandFilter(""); }}
                            disabled={!mapped || Boolean(productErrors[slot.key])}
                            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {selected ? "পরিবর্তন" : "পণ্য বাছুন"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">আপনার বিল্ড</h2>
                  <p className="mt-1 text-xs text-neutral-500">{selectedCount}টি কম্পোনেন্ট নির্বাচিত</p>
                </div>
                <button type="button" onClick={clearBuild} disabled={!selectedCount} className="text-xs font-medium text-neutral-500 hover:text-red-600 disabled:opacity-40">সব মুছুন</button>
              </div>

              <div className="my-5 space-y-3">
                {slots.filter((slot) => selections[slot.key]).map((slot) => {
                  const product = (productsBySlot[slot.key] || []).find((item) => item._id === selections[slot.key]);
                  return (
                    <div key={slot.key} className="flex items-start justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="text-xs text-neutral-400">{slot.label}</p>
                        <p className="mt-0.5 line-clamp-2 font-medium text-neutral-700">{product?.title || "নির্বাচিত পণ্য আর পাওয়া যাচ্ছে না"}</p>
                      </div>
                      <span className="shrink-0 font-semibold text-neutral-800">{product ? formatBDT(priceOf(product)) : "—"}</span>
                    </div>
                  );
                })}
                {!selectedCount && <p className="rounded-xl bg-neutral-50 px-4 py-5 text-center text-sm text-neutral-500">এখনও কোনো কম্পোনেন্ট বাছা হয়নি।</p>}
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>মোট পণ্য</span><span>{selectedCount}টি</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">আনুমানিক মোট</span>
                  <strong className="text-xl text-brand">{formatBDT(totalPrice) || "৳0"}</strong>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={shareBuild} disabled={!selectedCount} className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40">লিংক শেয়ার</button>
                  <button type="button" onClick={() => window.print()} disabled={!selectedCount} className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40">প্রিন্ট</button>
                </div>
                <button
                  type="button"
                  onClick={checkCompatibility}
                  disabled={!selectedCount || checking}
                  className="mt-3 w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {checking ? "কম্প্যাটিবিলিটি যাচাই হচ্ছে..." : "কম্প্যাটিবিলিটি যাচাই"}
                </button>
                {result?.compatible && (
                  <button
                    type="button"
                    onClick={addBuildToCart}
                    disabled={!requiredSlots.every((slot) => selections[slot.key]) || adding}
                    className="mt-2 w-full rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {adding ? "কার্টে যোগ হচ্ছে..." : "সম্পূর্ণ বিল্ড কার্টে যোগ করুন"}
                  </button>
                )}
              </div>
            </section>

            {result && (
              <section className={`mt-4 rounded-2xl border p-5 ${result.compatible ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                <h3 className={`font-bold ${result.compatible ? "text-green-800" : "text-amber-900"}`}>
                  {result.compatible ? "সম্ভাব্য কম্প্যাটিবিলিটি ঠিক আছে" : "কিছু বিষয় যাচাই করুন"}
                </h3>
                <p className="mt-2 text-sm text-neutral-700">আনুমানিক পাওয়ার: প্রায় {result.estimatedWattage}W</p>
                {result.issues?.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900">
                    {result.issues.map((issue, index) => <li key={index}>{issue}</li>)}
                  </ul>
                )}
                <p className="mt-3 text-xs leading-5 text-neutral-500">এই যাচাই পণ্যের তথ্য ও স্পেকের ওপর নির্ভরশীল। কেনার আগে প্রস্তুতকারকের বিস্তারিত স্পেক মিলিয়ে নিন।</p>
              </section>
            )}
          </aside>
        </div>
      )}

      {activeSlot && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-neutral-950/60 p-0 sm:items-center sm:p-5"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveSlot(null); }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="picker-title" className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="border-b border-neutral-200 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">কম্পোনেন্ট বাছাই</p>
                  <h2 id="picker-title" className="mt-1 text-xl font-bold text-neutral-900">{activeSlot.label}</h2>
                </div>
                <button type="button" onClick={() => setActiveSlot(null)} aria-label="বন্ধ করুন" className="rounded-full p-2 text-xl leading-none text-neutral-500 hover:bg-neutral-100">×</button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
                <label className="sr-only" htmlFor="builder-product-search">পণ্য খুঁজুন</label>
                <input id="builder-product-search" autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="নাম দিয়ে পণ্য খুঁজুন..." className="min-w-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand" />
                <label className="sr-only" htmlFor="builder-brand-filter">ব্র্যান্ড</label>
                <select id="builder-brand-filter" value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm">
                  <option value="">সব ব্র্যান্ড</option>
                  {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                </select>
                <label className="sr-only" htmlFor="builder-product-sort">পণ্যের ক্রম</label>
                <select id="builder-product-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm">
                  <option value="popular">প্রস্তাবিত</option>
                  <option value="price-low">দাম: কম থেকে বেশি</option>
                  <option value="price-high">দাম: বেশি থেকে কম</option>
                </select>
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} className="h-4 w-4 accent-brand" />
                শুধু স্টকে থাকা পণ্য
              </label>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6">
              {productErrors[activeSlot.key] ? (
                <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{productErrors[activeSlot.key]}</p>
              ) : visibleProducts.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => {
                    const selected = selections[activeSlot.key] === product._id;
                    return (
                      <article key={product._id} className={`flex min-w-0 flex-col rounded-xl border p-3 transition ${selected ? "border-brand ring-1 ring-brand" : "border-neutral-200 hover:border-neutral-400"}`}>
                        <div className="relative mb-3 h-36 overflow-hidden rounded-lg bg-neutral-50"><ProductImage product={product} /></div>
                        <div className="mb-1 flex items-center justify-between gap-2 text-xs text-neutral-400">
                          <span>{product.brandId?.name || "ব্র্যান্ড"}</span>
                          <span className={product.stock > 0 ? "text-green-700" : "text-red-600"}>{product.stock > 0 ? `স্টকে ${product.stock}` : "স্টক নেই"}</span>
                        </div>
                        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-neutral-800">{product.title}</h3>
                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div>
                            {product.discountPrice != null && product.discountPrice < product.price && <p className="text-xs text-neutral-400 line-through">{formatBDT(product.price)}</p>}
                            <strong className="text-base text-brand">{formatBDT(priceOf(product))}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => select(activeSlot.key, product._id)}
                            disabled={product.stock <= 0}
                            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {selected ? "নির্বাচিত" : "বিল্ডে যোগ"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 px-5 py-12 text-center">
                  <h3 className="font-semibold text-neutral-800">{activeProducts.length ? "কোনো মিল পাওয়া যায়নি" : "এই বিভাগে এখনো পণ্য নেই"}</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                    {activeProducts.length
                      ? "অন্য নাম বা ব্র্যান্ড দিয়ে খুঁজুন, অথবা স্টক ফিল্টার পরিবর্তন করুন।"
                      : "অ্যাডমিন প্যানেল থেকে এই সাবক্যাটাগরিতে পণ্য যোগ ও প্রকাশিত হলে এখানে দেখা যাবে।"}
                  </p>
                  {activeProducts.length > 0 && <button type="button" onClick={() => { setSearch(""); setBrandFilter(""); setInStockOnly(false); }} className="mt-4 text-sm font-semibold text-brand">সব ফিল্টার মুছুন</button>}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
      <style jsx global>{`
        @media print {
          header, footer, nav, button { display: none !important; }
          main { max-width: none !important; padding: 0 !important; }
          aside { position: static !important; }
          body { background: white !important; }
        }
      `}</style>
    </main>
  );
}

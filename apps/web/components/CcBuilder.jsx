"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatBDT } from "@/lib/format";

const priceOf = (product) => Number(product.discountPrice ?? product.price) || 0;

function ProductPicker({ id, label, description, products, value, onChange, required }) {
  const selected = products.find((product) => product._id === value);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-neutral-900">{label}</h2>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${required ? "bg-red-50 text-red-700" : "bg-neutral-100 text-neutral-600"}`}>
          {required ? "আবশ্যিক" : "ঐচ্ছিক"}
        </span>
      </div>

      <label htmlFor={id} className="sr-only">{label} নির্বাচন করুন</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
      >
        <option value="">পণ্য বাছুন</option>
        {products.map((product) => (
          <option key={product._id} value={product._id} disabled={(product.stock ?? 0) <= 0}>
            {product.title} — {formatBDT(priceOf(product))}{(product.stock ?? 0) <= 0 ? " (স্টক নেই)" : ""}
          </option>
        ))}
      </select>

      {selected && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
            {selected.images?.[0] ? (
              <Image src={selected.images[0]} alt="" fill unoptimized sizes="56px" className="object-contain p-1" />
            ) : (
              <span className="flex h-full items-center justify-center text-[10px] text-neutral-400">ছবি নেই</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-medium text-neutral-800">{selected.title}</p>
            <p className="mt-1 text-sm font-bold text-brand">{formatBDT(priceOf(selected))}</p>
          </div>
        </div>
      )}
      {products.length === 0 && (
        <p className="mt-3 text-xs text-neutral-500">এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য পাওয়া যায়নি।</p>
      )}
    </section>
  );
}

export default function CcBuilder({ cameras, packages, recorders, accessories }) {
  const [mode, setMode] = useState("custom");
  const [selections, setSelections] = useState({ camera: "", recorder: "", package: "", accessory: "" });
  const [cameraCount, setCameraCount] = useState(1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();

  const selectedProducts = useMemo(() => {
    const list = mode === "package"
      ? [[packages, selections.package, 1]]
      : [[cameras, selections.camera, cameraCount], [recorders, selections.recorder, 1], [accessories, selections.accessory, 1]];
    return list
      .map(([items, id, quantity]) => ({ product: items.find((item) => item._id === id), quantity }))
      .filter(({ product }) => product);
  }, [accessories, cameraCount, cameras, mode, packages, recorders, selections]);

  const total = selectedProducts.reduce((sum, { product, quantity }) => sum + priceOf(product) * quantity, 0);
  const requiredSelected = mode === "package"
    ? Boolean(selections.package)
    : Boolean(selections.camera && selections.recorder);

  function choose(key, value) {
    setSelections((current) => ({ ...current, [key]: value }));
    setError("");
    setNotice("");
  }

  async function addBuildToCart() {
    if (!requiredSelected) {
      setError(mode === "package" ? "একটি CC Camera Package বেছে নিন।" : "CC Camera এবং DVR/XVR বেছে নিন।");
      return;
    }
    setAdding(true);
    setError("");
    setNotice("");
    try {
      for (const { product, quantity } of selectedProducts) {
        await addItem(product._id, null, quantity);
      }
      setNotice("নির্বাচিত পণ্যগুলো কার্টে যোগ করা হয়েছে।");
    } catch (addError) {
      setError(addError.message || "কার্টে পণ্য যোগ করা যায়নি।");
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-700 p-6 text-white shadow-lg sm:p-9">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Bangal Computer</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">আপনার CCTV সেটআপ তৈরি করুন</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
          রেডিমেড CC Camera Package বেছে নিন অথবা ক্যামেরা, DVR/XVR ও accessories দিয়ে নিজের সেটআপ সাজান।
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {[
          ["custom", "নিজে সেটআপ সাজান", "ক্যামেরা, রেকর্ডার ও accessories আলাদাভাবে বাছুন।"],
          ["package", "রেডিমেড প্যাকেজ", "একটি CC Camera Package বেছে নিন।"],
        ].map(([key, title, description]) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => { setMode(key); setError(""); setNotice(""); }}
            className={`rounded-2xl border p-4 text-left transition sm:p-5 ${mode === key ? "border-brand bg-red-50 ring-2 ring-brand/15" : "border-neutral-200 bg-white hover:border-neutral-300"}`}
          >
            <span className="block font-bold text-neutral-900">{title}</span>
            <span className="mt-1 block text-sm text-neutral-600">{description}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {mode === "package" ? (
            <ProductPicker
              id="cc-package"
              label="CC Camera Package"
              description="একটি রেডিমেড ক্যামেরা প্যাকেজ বাছুন।"
              products={packages}
              value={selections.package}
              onChange={(value) => choose("package", value)}
              required
            />
          ) : (
            <>
              <ProductPicker
                id="cc-camera"
                label="CC Camera"
                description="আপনার প্রয়োজন অনুযায়ী ক্যামেরা মডেল বাছুন।"
                products={cameras}
                value={selections.camera}
                onChange={(value) => choose("camera", value)}
                required
              />
              {selections.camera && (
                <section className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">ক্যামেরার সংখ্যা</h2>
                    <p className="mt-1 text-xs text-neutral-500">একই মডেলের ক্যামেরা কতটি লাগবে?</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={cameraCount}
                    onChange={(event) => setCameraCount(Math.min(16, Math.max(1, Number(event.target.value) || 1)))}
                    aria-label="ক্যামেরার সংখ্যা"
                    className="h-10 w-20 rounded-lg border border-neutral-300 px-3 text-center text-sm"
                  />
                </section>
              )}
              <ProductPicker
                id="cc-recorder"
                label="DVR / XVR"
                description="ক্যামেরার ফুটেজ সংরক্ষণ ও দেখার জন্য রেকর্ডার বাছুন।"
                products={recorders}
                value={selections.recorder}
                onChange={(value) => choose("recorder", value)}
                required
              />
              <ProductPicker
                id="cc-accessory"
                label="CC Camera Accessories"
                description="প্রয়োজন হলে একটি accessories পণ্য যোগ করুন।"
                products={accessories}
                value={selections.accessory}
                onChange={(value) => choose("accessory", value)}
              />
            </>
          )}
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
            মোট দাম নির্বাচিত পণ্যের ভিত্তিতে আনুমানিক। ক্যামেরা ও রেকর্ডারের সামঞ্জস্য কেনার আগে যাচাই করে নিন।
          </p>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">আপনার সেটআপ</h2>
            {selectedProducts.length ? (
              <ul className="mt-4 space-y-3">
                {selectedProducts.map(({ product, quantity }) => (
                  <li key={product._id} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 text-neutral-600">{product.title}{quantity > 1 ? ` × ${quantity}` : ""}</span>
                    <span className="shrink-0 font-semibold text-neutral-900">{formatBDT(priceOf(product) * quantity)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">পণ্য বাছলে আপনার সেটআপ এখানে দেখা যাবে।</p>
            )}
            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
              <span className="font-semibold text-neutral-700">আনুমানিক মোট</span>
              <span className="text-lg font-extrabold text-brand">{formatBDT(total) || "৳0"}</span>
            </div>
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {notice && <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}
            <button
              type="button"
              onClick={addBuildToCart}
              disabled={adding || !selectedProducts.length}
              className="mt-5 min-h-11 w-full rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? "কার্টে যোগ হচ্ছে..." : "সেটআপ কার্টে যোগ করুন"}
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}

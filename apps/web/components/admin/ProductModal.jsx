"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { adminFetch, UI } from "@/lib/admin-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const MAX_IMAGE_MB = 8;

const EMPTY = {
  categoryId: "",
  subcategoryId: "",
  brandId: "",
  title: "",
  sku: "",
  price: "",
  discountPrice: "",
  stock: "0",
  description: "",
  isFeatured: false,
  status: "published",
};

function Field({ label, required, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-neutral-200 p-4">
      <h3 className="mb-3 text-sm font-semibold text-neutral-800">{title}</h3>
      {children}
    </section>
  );
}

/**
 * One modal for everything a product needs. Mount it only while open
 * (`{modal && <ProductModal ... />}`) so every open starts with fresh state.
 *
 * Create flow: product is saved as a DRAFT first, then images upload, and only then
 * is it published — so a failed image upload never leaves a
 * half-finished product visible on the storefront. If a step fails the product is
 * already saved; pressing "সেভ" again just continues from where it stopped.
 */
export default function ProductModal({ productId = null, onClose, onSaved }) {
  const [tree, setTree] = useState([]);
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [specs, setSpecs] = useState([{ k: "", v: "" }]);
  const [variants, setVariants] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // [{ file, url }]
  const [savedId, setSavedId] = useState(productId);
  const [currentStatus, setCurrentStatus] = useState(null); // status stored in the DB right now
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const originalImages = useRef([]);
  const previewUrls = useRef([]);

  // ---- load categories, brands and (when editing) the product ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, b] = await Promise.all([
          fetch(`${API_URL}/categories`).then((r) => r.json()),
          fetch(`${API_URL}/brands`).then((r) => r.json()),
        ]);
        if (cancelled) return;
        setTree(c.data || []);
        setBrands(b.data || []);

        if (productId) {
          const { data: p } = await adminFetch(`/products/admin/one/${productId}`);
          if (cancelled) return;
          setForm({
            categoryId: p.categoryId,
            subcategoryId: p.subcategoryId,
            brandId: p.brandId,
            title: p.title,
            sku: p.sku,
            price: String(p.price ?? ""),
            discountPrice: p.discountPrice ? String(p.discountPrice) : "",
            stock: String(p.stock ?? 0),
            description: p.description || "",
            isFeatured: Boolean(p.isFeatured),
            status: p.status,
          });
          const rows = Object.entries(p.specs || {}).map(([k, v]) => ({ k, v }));
          setSpecs(rows.length ? rows : [{ k: "", v: "" }]);
          setVariants((p.variants || []).map((v) => ({ name: v.name, price: String(v.price), stock: String(v.stock ?? 0) })));
          setExistingImages(p.images || []);
          originalImages.current = p.images || [];
          setCurrentStatus(p.status);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [productId]);

  // ---- derived lists ----
  const mainCat = tree.find((c) => c._id === form.categoryId);
  const subs = mainCat?.subcategories || [];
  const sub = subs.find((s) => s._id === form.subcategoryId);
  const brandBySlug = useMemo(() => Object.fromEntries(brands.map((b) => [b.slug, b])), [brands]);

  let brandOptions = !showAllBrands && sub?.brands?.length ? sub.brands.map((b) => brandBySlug[b.slug]).filter(Boolean) : brands;
  if (form.brandId && !brandOptions.some((b) => b._id === form.brandId)) {
    const current = brands.find((b) => b._id === form.brandId);
    if (current) brandOptions = [...brandOptions, current];
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  function pickCategory(e) {
    setForm((f) => ({ ...f, categoryId: e.target.value, subcategoryId: "", brandId: "" }));
    setShowAllBrands(false);
  }
  function pickSubcategory(e) {
    setForm((f) => ({ ...f, subcategoryId: e.target.value, brandId: "" }));
    setShowAllBrands(false);
  }

  // ---- images ----
  function onFilesPicked(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    const accepted = [];
    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" ইমেজ ফাইল নয়`);
        continue;
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        setError(`"${file.name}" ${MAX_IMAGE_MB}MB-এর বেশি বড়`);
        continue;
      }
      const url = URL.createObjectURL(file);
      previewUrls.current.push(url);
      accepted.push({ file, url });
    }
    if (accepted.length) setNewFiles((list) => [...list, ...accepted]);
  }

  function removeNewFile(url) {
    URL.revokeObjectURL(url);
    setNewFiles((list) => list.filter((f) => f.url !== url));
  }

  function moveImage(index, dir) {
    setExistingImages((list) => {
      const next = [...list];
      const j = index + dir;
      if (j < 0 || j >= next.length) return list;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  async function removeExistingImage(url) {
    if (!window.confirm("এই ছবিটি স্থায়ীভাবে মুছে ফেলবেন?")) return;
    try {
      if (savedId) await adminFetch(`/products/${savedId}/images`, { method: "DELETE", body: { url } });
      setExistingImages((list) => list.filter((u) => u !== url));
      originalImages.current = originalImages.current.filter((u) => u !== url);
    } catch (err) {
      setError(err.message);
    }
  }

  // ---- specs / variants rows ----
  const updateRow = (setter) => (i, key, value) => setter((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  const updateSpec = updateRow(setSpecs);
  const updateVariant = updateRow(setVariants);

  // ---- validation + save ----
  function validate() {
    if (!form.categoryId) return "ক্যাটাগরি বাছুন";
    if (!form.subcategoryId) return "সাবক্যাটাগরি বাছুন";
    if (!form.brandId) return "ব্র্যান্ড বাছুন";
    if (!form.title.trim()) return "প্রোডাক্টের নাম দিন";
    const price = Number(form.price);
    if (!(price > 0)) return "দাম ০-র বেশি হতে হবে";
    if (form.discountPrice !== "") {
      const d = Number(form.discountPrice);
      if (!(d > 0) || d >= price) return "ডিসকাউন্ট দাম অবশ্যই মূল দামের চেয়ে কম হতে হবে";
    }
    const stock = Number(form.stock || 0);
    if (!Number.isInteger(stock) || stock < 0) return "স্টক ০ বা তার বেশি পূর্ণ সংখ্যা হতে হবে";
    for (const v of variants) {
      if (v.name.trim() && !(Number(v.price) > 0)) return `ভ্যারিয়েন্ট "${v.name}"-এর দাম দিন`;
    }
    if (!savedId && newFiles.length === 0 && existingImages.length === 0) return "অন্তত একটি ছবি দিন";
    return null;
  }

  async function ensureBrandLinked() {
    // Keeps the mega-menu brand list in sync so /category/sub/brand links work for this product
    const brand = brands.find((b) => b._id === form.brandId);
    if (sub && brand && !(sub.brands || []).some((b) => b.slug === brand.slug)) {
      try {
        await adminFetch(`/categories/${sub._id}/brands`, { method: "POST", body: { name: brand.name } });
      } catch {
        /* already linked or not critical */
      }
    }
  }

  async function save(e) {
    e.preventDefault();
    setError(null);
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);
    let id = savedId;
    try {
      const payload = {
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId,
        brandId: form.brandId,
        title: form.title.trim(),
        sku: form.sku.trim() || undefined,
        price: Number(form.price),
        discountPrice: form.discountPrice === "" ? null : Number(form.discountPrice),
        stock: Number(form.stock || 0),
        description: form.description,
        isFeatured: form.isFeatured,
        specs: Object.fromEntries(specs.filter((r) => r.k.trim() && r.v.trim()).map((r) => [r.k.trim(), r.v.trim()])),
        variants: variants
          .filter((v) => v.name.trim())
          .map((v) => ({ name: v.name.trim(), price: Number(v.price), stock: Number(v.stock || 0) })),
      };

      await ensureBrandLinked();

      if (!id) {
        const { data } = await adminFetch("/products", { method: "POST", body: { ...payload, status: "draft" } });
        id = data._id;
        setSavedId(id);
        setCurrentStatus("draft");
      } else {
        await adminFetch(`/products/${id}`, { method: "PUT", body: payload });
      }

      // reorder existing images (before uploading new ones — the API expects the exact existing set)
      if (existingImages.length > 1 && JSON.stringify(existingImages) !== JSON.stringify(originalImages.current)) {
        await adminFetch(`/products/${id}/images/reorder`, { method: "PUT", body: { images: existingImages } });
        originalImages.current = existingImages;
      }

      // upload new images (API takes up to 10 per request)
      for (let i = 0; i < newFiles.length; i += 10) {
        const fd = new FormData();
        newFiles.slice(i, i + 10).forEach((f) => fd.append("images", f.file));
        const { data } = await adminFetch(`/products/${id}/images`, { method: "POST", body: fd });
        setExistingImages(data.images);
        originalImages.current = data.images;
      }
      previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
      previewUrls.current = [];
      setNewFiles([]);

      if (form.status !== currentStatus) {
        await adminFetch(`/products/${id}/status`, { method: "PATCH", body: { status: form.status } });
        setCurrentStatus(form.status);
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(id ? `${err.message} — প্রোডাক্ট সেভ হয়ে গেছে; আবার "সেভ করুন" চাপলে বাকি কাজ সম্পন্ন হবে।` : err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <form onSubmit={save} className="my-6 flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h2 className="text-lg font-bold text-neutral-900">{savedId ? "প্রোডাক্ট এডিট করুন" : "নতুন প্রোডাক্ট যোগ করুন"}</h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-neutral-400 hover:text-neutral-700" aria-label="বন্ধ করুন">
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-neutral-400">লোড হচ্ছে...</div>
        ) : (
          <div className="space-y-4 overflow-y-auto p-5">
            <Section title="ক্যাটাগরি ও ব্র্যান্ড">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label="ক্যাটাগরি" required>
                  <select className={UI.input} value={form.categoryId} onChange={pickCategory}>
                    <option value="">— বাছুন —</option>
                    {tree.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="সাবক্যাটাগরি" required>
                  <select className={UI.input} value={form.subcategoryId} onChange={pickSubcategory} disabled={!form.categoryId}>
                    <option value="">— বাছুন —</option>
                    {subs.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ব্র্যান্ড" required>
                  <select className={UI.input} value={form.brandId} onChange={set("brandId")} disabled={!form.subcategoryId}>
                    <option value="">— বাছুন —</option>
                    {brandOptions.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {sub?.brands?.length > 0 && (
                <label className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                  <input type="checkbox" checked={showAllBrands} onChange={(e) => setShowAllBrands(e.target.checked)} />
                  এই সাবক্যাটাগরির বাইরের ব্র্যান্ডও দেখান
                </label>
              )}
            </Section>

            <Section title="মূল তথ্য">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label="প্রোডাক্টের নাম" required className="md:col-span-2">
                  <input className={UI.input} value={form.title} onChange={set("title")} placeholder="যেমন: MSI Modern 14 C13M Core i5 13th Gen" />
                </Field>
                <Field label="SKU" hint="ফাঁকা রাখলে নিজে থেকে তৈরি হবে">
                  <input className={UI.input} value={form.sku} onChange={set("sku")} disabled={Boolean(productId)} />
                </Field>
                <Field label="দাম (৳)" required>
                  <input type="number" min="0" className={UI.input} value={form.price} onChange={set("price")} />
                </Field>
                <Field label="ডিসকাউন্ট দাম (৳)" hint="মূল দামের চেয়ে কম হতে হবে">
                  <input type="number" min="0" className={UI.input} value={form.discountPrice} onChange={set("discountPrice")} />
                </Field>
                <Field label="স্টক">
                  <input type="number" min="0" className={UI.input} value={form.stock} onChange={set("stock")} />
                </Field>
              </div>
            </Section>

            <Section title="ছবি">
              {existingImages.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-3">
                  {existingImages.map((url, i) => (
                    <div key={url} className="w-24">
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-contain" />
                        {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand px-1 text-[10px] text-white">মূল ছবি</span>}
                      </div>
                      <div className="mt-1 flex justify-between text-xs">
                        <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="px-1 text-neutral-500 hover:text-brand disabled:opacity-30">
                          ←
                        </button>
                        <button type="button" onClick={() => removeExistingImage(url)} className="px-1 text-red-500 hover:underline">
                          মুছুন
                        </button>
                        <button type="button" onClick={() => moveImage(i, 1)} disabled={i === existingImages.length - 1} className="px-1 text-neutral-500 hover:text-brand disabled:opacity-30">
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {newFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-3">
                  {newFiles.map((f) => (
                    <div key={f.url} className="w-24">
                      <div className="aspect-square overflow-hidden rounded-lg border border-dashed border-brand/50 bg-neutral-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.url} alt="" className="h-full w-full object-contain" />
                      </div>
                      <button type="button" onClick={() => removeNewFile(f.url)} className="mt-1 w-full text-center text-xs text-red-500 hover:underline">
                        বাদ দিন
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-neutral-400 px-4 py-2 text-sm text-neutral-600 hover:border-brand hover:text-brand">
                + ছবি যোগ করুন (একসাথে একাধিক)
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesPicked} />
              </label>
              <p className="mt-1 text-[11px] text-neutral-400">প্রতিটি ছবি সর্বোচ্চ {MAX_IMAGE_MB}MB। প্রথম ছবিটি প্রোডাক্টের মূল ছবি হবে।</p>
            </Section>

            <Section title="বিবরণ">
              <textarea rows={5} className={UI.input} value={form.description} onChange={set("description")} placeholder="প্রোডাক্টের বিস্তারিত বিবরণ লিখুন" />
            </Section>

            <Section title="স্পেসিফিকেশন">
              <datalist id="spec-keys">
                {["Processor", "RAM", "Storage", "Display", "Graphics", "Battery", "Operating System", "Warranty"].map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
              <div className="space-y-2">
                {specs.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    <input list="spec-keys" className={`${UI.input} w-1/3`} placeholder="নাম (যেমন RAM)" value={row.k} onChange={(e) => updateSpec(i, "k", e.target.value)} />
                    <input className={UI.input} placeholder="মান (যেমন 16GB DDR5)" value={row.v} onChange={(e) => updateSpec(i, "v", e.target.value)} />
                    <button type="button" onClick={() => setSpecs((r) => (r.length > 1 ? r.filter((_, idx) => idx !== i) : [{ k: "", v: "" }]))} className="px-2 text-neutral-400 hover:text-red-500">
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setSpecs((r) => [...r, { k: "", v: "" }])} className="mt-2 text-sm text-brand hover:underline">
                + স্পেক যোগ করুন
              </button>
            </Section>

            <Section title="ভ্যারিয়েন্ট (ঐচ্ছিক — যেমন কালার/সাইজ)">
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div key={i} className="flex gap-2">
                    <input className={UI.input} placeholder="নাম (যেমন Black / 16GB+512GB)" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} />
                    <input type="number" min="0" className={`${UI.input} w-32`} placeholder="দাম" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} />
                    <input type="number" min="0" className={`${UI.input} w-24`} placeholder="স্টক" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} />
                    <button type="button" onClick={() => setVariants((r) => r.filter((_, idx) => idx !== i))} className="px-2 text-neutral-400 hover:text-red-500">
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setVariants((r) => [...r, { name: "", price: form.price, stock: "0" }])} className="mt-2 text-sm text-brand hover:underline">
                + ভ্যারিয়েন্ট যোগ করুন
              </button>
            </Section>

            <Section title="প্রকাশ">
              <div className="flex flex-wrap items-center gap-6">
                {form.status === "published" ? (
                  <p className="text-sm text-neutral-600">
                    <span className="mr-2 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">প্রকাশিত</span>
                    সাইটে থাকবে; সরাতে প্রোডাক্টটি মুছে ফেলুন।
                  </p>
                ) : (
                  <p className="text-sm text-amber-700">ড্রাফট — সেভ করার পর পাবলিশ করতে প্রোডাক্ট তালিকা থেকে পাবলিশ চাপুন।</p>
                )}
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={form.isFeatured} onChange={set("isFeatured")} />
                  ফিচার্ড প্রোডাক্ট
                </label>
              </div>
            </Section>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3">
          <p className="min-w-0 flex-1 text-sm text-red-500">{error}</p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={onClose} className={UI.btnGhost}>
              বাতিল
            </button>
            <button type="submit" disabled={saving || loading} className={UI.btn}>
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

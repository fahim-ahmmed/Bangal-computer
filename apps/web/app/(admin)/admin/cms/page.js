"use client";

import { useEffect, useRef, useState } from "react";
import { UI, adminFetch } from "@/lib/admin-api";
import { cmsApi } from "@/lib/content-client";

const EMPTY_BANNER = { image: "", link: "", title: "", position: "main" };
const EMPTY_HAPPY = { active: false, title: "", discountText: "", startsAt: "", endsAt: "", bannerImage: "" };
const POSITION_LABEL = { main: "মূল স্লাইডার", side: "সাইড ব্যানার" };
const RATIO = { main: 12 / 5, side: 11 / 5 };
const SIZE_HINT = { main: "1200×500", side: "600×275" };
const MAX_MB = 8;

export default function AdminCmsPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(EMPTY_BANNER);
  const [happy, setHappy] = useState(EMPTY_HAPPY);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dims, setDims] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    cmsApi.bannersAdmin().then(setBanners).catch((e) => setError(e.message));
    cmsApi
      .happyHourAdmin()
      .then((h) => setHappy((cur) => ({ ...cur, ...h })))
      .catch(() => {});
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFile(file) {
    if (!file) return;
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("শুধু ইমেজ ফাইল (JPG, PNG, WebP) বাছুন।");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`ছবির সাইজ ${MAX_MB}MB এর বেশি হতে পারবে না।`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await adminFetch("/cms/banners/upload", { method: "POST", body: fd });
      setDims(null);
      setForm((f) => ({ ...f, image: res.data.url }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function addBanner(e) {
    e.preventDefault();
    if (!form.image) {
      setUploadError("আগে একটি ছবি বাছুন বা ছবির লিংক দিন।");
      return;
    }
    try {
      await cmsApi.addBanner(form);
      setForm((f) => ({ ...EMPTY_BANNER, position: f.position }));
      setDims(null);
      setUploadError("");
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  const toggleBanner = (b) => cmsApi.updateBanner(b._id, { isActive: !b.isActive }).then(load).catch((e) => alert(e.message));
  const removeBanner = (b) => window.confirm("ব্যানারটি মুছবেন?") && cmsApi.deleteBanner(b._id).then(load).catch((e) => alert(e.message));
  const movePosition = (b) =>
    cmsApi.updateBanner(b._id, { position: b.position === "side" ? "main" : "side" }).then(load).catch((e) => alert(e.message));

  async function saveHappyHour(e) {
    e.preventDefault();
    try {
      await cmsApi.setHappyHour(happy);
      load();
      alert("Happy Hour সেভ হয়েছে");
    } catch (err) {
      alert(err.message);
    }
  }

  const activeSide = banners.filter((b) => b.position === "side" && b.isActive).length;
  const target = RATIO[form.position];
  const ratioOff = dims ? Math.abs(dims.w / dims.h - target) / target > 0.2 : false;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-neutral-900">হোমপেজ CMS</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-1 font-semibold text-neutral-800">হোমপেজ ব্যানার</h2>
        <p className="mb-4 text-xs text-neutral-500">
          মূল স্লাইডার বড় ব্যানার হিসেবে বামে স্লাইড করবে। সাইড ব্যানার ডানে একটার নিচে একটা (সর্বোচ্চ ২টি) দেখাবে।
        </p>

        <div className="mb-5 space-y-2">
          {banners.map((b) => (
            <div key={b._id} className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-100 p-2">
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 text-sm text-neutral-700">
                <span className="block truncate">{b.title || b.image}</span>
                <span className="text-xs text-neutral-400">{b.isActive ? "চালু" : "লুকানো"}</span>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  b.position === "side" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                }`}
              >
                {POSITION_LABEL[b.position === "side" ? "side" : "main"]}
              </span>
              <button onClick={() => movePosition(b)} className="text-xs text-neutral-600 hover:underline">
                {b.position === "side" ? "মূলে নিন" : "সাইডে নিন"}
              </button>
              <button onClick={() => toggleBanner(b)} className="text-xs text-brand hover:underline">{b.isActive ? "লুকান" : "দেখান"}</button>
              <button onClick={() => removeBanner(b)} className="text-xs text-red-500 hover:underline">মুছুন</button>
            </div>
          ))}
          {banners.length === 0 && <p className="text-sm text-neutral-400">কোনো ব্যানার নেই।</p>}
          {activeSide > 2 && (
            <p className="text-xs text-amber-600">চালু সাইড ব্যানার {activeSide}টি, কিন্তু সাইটে প্রথম ২টি দেখাবে।</p>
          )}
        </div>

        <form onSubmit={addBanner} className="space-y-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-800">নতুন ব্যানার যোগ করুন</h3>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-neutral-600" htmlFor="banner-position">ধরন</label>
            <select
              id="banner-position"
              className={`${UI.input} max-w-[12rem]`}
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            >
              <option value="main">মূল স্লাইডার</option>
              <option value="side">সাইড ব্যানার</option>
            </select>
            <span className="text-xs text-neutral-500">প্রস্তাবিত মাপ: {SIZE_HINT[form.position]} px</span>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {!form.image ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => !uploading && fileRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !uploading && fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (!uploading) handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                dragOver ? "border-brand bg-red-50" : "border-neutral-300 bg-white hover:border-brand"
              }`}
            >
              <span className="text-sm font-semibold text-neutral-800">
                {uploading ? "আপলোড হচ্ছে..." : "ডিভাইস থেকে ছবি বাছুন"}
              </span>
              <span className="text-xs text-neutral-500">
                এখানে ক্লিক করুন বা ছবি টেনে এনে ছাড়ুন (JPG, PNG, WebP, সর্বোচ্চ {MAX_MB}MB)
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-4 rounded-lg border border-neutral-200 bg-white p-3">
              <div className="w-full max-w-sm overflow-hidden rounded-lg bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="নির্বাচিত ব্যানার"
                  className="h-auto w-full object-cover"
                  onLoad={(e) => setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                  onError={() => setDims(null)}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2 text-sm">
                {dims && <p className="text-neutral-700">ছবির মাপ: {dims.w}×{dims.h} px</p>}
                {ratioOff && (
                  <p className="text-xs text-amber-600">
                    এই মাপ প্রস্তাবিত অনুপাতের সাথে মেলে না, সাইটে ছবির কিছু অংশ কাটা পড়তে পারে। প্রস্তাবিত: {SIZE_HINT[form.position]} px।
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-semibold text-brand hover:underline disabled:opacity-50"
                  >
                    {uploading ? "আপলোড হচ্ছে..." : "অন্য ছবি বাছুন"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, image: "" }));
                      setDims(null);
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    ছবি সরান
                  </button>
                </div>
              </div>
            </div>
          )}

          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

          <div className="flex flex-wrap gap-2">
            <input
              className={`${UI.input} max-w-xs`}
              placeholder="অথবা ছবির লিংক (URL) দিন"
              value={form.image}
              onChange={(e) => {
                setDims(null);
                setForm((f) => ({ ...f, image: e.target.value }));
              }}
            />
            <input className={`${UI.input} max-w-xs`} placeholder="ক্লিক করলে যাবে (ঐচ্ছিক, যেমন /laptop)" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
            <input className={`${UI.input} max-w-xs`} placeholder="টাইটেল (ঐচ্ছিক)" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>

          <button className={UI.btn} disabled={uploading}>
            {uploading ? "অপেক্ষা করুন..." : "+ ব্যানার যোগ করুন"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-neutral-800">Happy Hour</h2>
        <form onSubmit={saveHappyHour} className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={Boolean(happy.active)} onChange={(e) => setHappy((h) => ({ ...h, active: e.target.checked }))} />
            সক্রিয় (হোমপেজে ব্যানার দেখাবে)
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input className={UI.input} placeholder="টাইটেল (যেমন Weekend Happy Hour)" value={happy.title || ""} onChange={(e) => setHappy((h) => ({ ...h, title: e.target.value }))} />
            <input className={UI.input} placeholder="ছাড়ের বিবরণ (যেমন সব ল্যাপটপে ৫% ছাড়)" value={happy.discountText || ""} onChange={(e) => setHappy((h) => ({ ...h, discountText: e.target.value }))} />
            <input type="datetime-local" className={UI.input} value={happy.startsAt || ""} onChange={(e) => setHappy((h) => ({ ...h, startsAt: e.target.value }))} />
            <input type="datetime-local" className={UI.input} value={happy.endsAt || ""} onChange={(e) => setHappy((h) => ({ ...h, endsAt: e.target.value }))} />
          </div>
          <button className={UI.btn}>সেভ করুন</button>
        </form>
      </section>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { UI } from "@/lib/admin-api";
import { cmsApi } from "@/lib/content-client";

const EMPTY_BANNER = { image: "", link: "", title: "" };

export default function AdminCmsPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(EMPTY_BANNER);
  const [happy, setHappy] = useState({ active: false, title: "", discountText: "", startsAt: "", endsAt: "", bannerImage: "" });
  const [error, setError] = useState(null);

  const load = () => {
    cmsApi.bannersAdmin().then(setBanners).catch((e) => setError(e.message));
    cmsApi.happyHour().then((h) => setHappy({ ...happy, ...h })).catch(() => {});
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addBanner(e) {
    e.preventDefault();
    if (!form.image) return;
    try {
      await cmsApi.addBanner(form);
      setForm(EMPTY_BANNER);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  const toggleBanner = (b) => cmsApi.updateBanner(b._id, { isActive: !b.isActive }).then(load).catch((e) => alert(e.message));
  const removeBanner = (b) => window.confirm("ব্যানারটি মুছবেন?") && cmsApi.deleteBanner(b._id).then(load).catch((e) => alert(e.message));

  async function saveHappyHour(e) {
    e.preventDefault();
    try {
      await cmsApi.setHappyHour(happy);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-neutral-900">হোমপেজ CMS</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-neutral-800">ব্যানার স্লাইডার</h2>
        <div className="mb-4 space-y-2">
          {banners.map((b) => (
            <div key={b._id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-2">
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 text-sm text-neutral-700">{b.title || b.image}</div>
              <button onClick={() => toggleBanner(b)} className="text-xs text-brand hover:underline">{b.isActive ? "লুকান" : "দেখান"}</button>
              <button onClick={() => removeBanner(b)} className="text-xs text-red-500 hover:underline">মুছুন</button>
            </div>
          ))}
          {banners.length === 0 && <p className="text-sm text-neutral-400">কোনো ব্যানার নেই।</p>}
        </div>
        <form onSubmit={addBanner} className="flex flex-wrap gap-2">
          <input required className={`${UI.input} max-w-xs`} placeholder="ইমেজ URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
          <input className={`${UI.input} max-w-xs`} placeholder="লিংক (ঐচ্ছিক)" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
          <input className={`${UI.input} max-w-xs`} placeholder="টাইটেল (ঐচ্ছিক)" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <button className={UI.btn}>+ ব্যানার যোগ করুন</button>
        </form>
        <p className="mt-2 text-xs text-neutral-400">ইমেজ URL হিসেবে Cloudinary-তে আপলোড করা লিংক বা যেকোনো পাবলিক ইমেজ URL দিন।</p>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-neutral-800">Happy Hour</h2>
        <form onSubmit={saveHappyHour} className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={happy.active} onChange={(e) => setHappy((h) => ({ ...h, active: e.target.checked }))} />
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

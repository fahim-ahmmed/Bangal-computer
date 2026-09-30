"use client";

import { useEffect, useState } from "react";
import { UI } from "@/lib/admin-api";
import { builderApi, settingsApi } from "@/lib/tools-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminToolsPage() {
  const [slots, setSlots] = useState(null);
  const [categories, setCategories] = useState([]);
  const [laptopSetting, setLaptopSetting] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const [slotData, catTree, laptopData] = await Promise.all([
        builderApi.slots(),
        fetch(`${API_URL}/categories`).then((r) => r.json()),
        settingsApi.laptopCategory(),
      ]);
      setSlots(slotData);
      setCategories((catTree.data || []).flatMap((c) => (c.subcategories || []).map((s) => ({ ...s, mainName: c.name }))));
      setLaptopSetting(laptopData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setSlot(key, subcategoryId) {
    try {
      await builderApi.setSlot(key, subcategoryId || null);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function setLaptopCategory(slug) {
    try {
      await settingsApi.setLaptopCategory(slug);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-neutral-900">Extra Tools সেটিংস</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-1 font-semibold text-neutral-800">PC Builder — স্লট ম্যাপিং</h2>
        <p className="mb-4 text-sm text-neutral-500">প্রতিটা স্লট কোন সাবক্যাটাগরি থেকে প্রোডাক্ট দেখাবে সেটা বাছুন।</p>
        <div className="space-y-3">
          {slots?.map((slot) => (
            <div key={slot.key} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-sm font-medium text-neutral-700">{slot.label}</span>
              <select
                className={`${UI.input} max-w-sm`}
                value={slot.subcategoryId?._id || ""}
                onChange={(e) => setSlot(slot.key, e.target.value)}
              >
                <option value="">— যুক্ত করা হয়নি —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.mainName} › {c.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {!slots && <p className="text-neutral-400">লোড হচ্ছে...</p>}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-1 font-semibold text-neutral-800">Laptop Finder — ক্যাটাগরি</h2>
        <p className="mb-4 text-sm text-neutral-500">Laptop Finder কোন Main Category-র মধ্যে খুঁজবে সেটা বাছুন।</p>
        <select
          className={`${UI.input} max-w-sm`}
          value={laptopSetting?.current || ""}
          onChange={(e) => setLaptopCategory(e.target.value)}
        >
          <option value="">— অটো-ডিটেক্ট (নামে &quot;Laptop&quot; খোঁজে) —</option>
          {laptopSetting?.categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </section>
    </div>
  );
}

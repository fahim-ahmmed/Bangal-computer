"use client";

import { useEffect, useState } from "react";
import { addressesApi } from "@/lib/orders-client";

const EMPTY = { label: "Home", line1: "", line2: "", city: "", area: "", phone: "", isDefault: false };
const input = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";

export default function AddressesPage() {
  const [list, setList] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => addressesApi.list().then(setList).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function add(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addressesApi.add(form);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const run = (fn) => fn().then(load).catch((e) => alert(e.message));

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        {list === null && <p className="text-neutral-400">লোড হচ্ছে...</p>}
        {list?.length === 0 && <p className="text-neutral-500">কোনো সেভ করা ঠিকানা নেই।</p>}
        {list?.map((a) => (
          <div key={a._id} className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 p-4 text-sm">
            <div>
              <div className="font-semibold text-neutral-800">
                {a.label || "ঠিকানা"} {a.isDefault && <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">ডিফল্ট</span>}
              </div>
              <div className="text-neutral-600">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.area ? `${a.area}, ` : ""}{a.city}</div>
              <div className="text-neutral-500">ফোন: {a.phone}</div>
            </div>
            <div className="flex shrink-0 gap-3 text-xs">
              {!a.isDefault && <button onClick={() => run(() => addressesApi.update(a._id, { isDefault: true }))} className="text-brand hover:underline">ডিফল্ট করুন</button>}
              <button onClick={() => window.confirm("ঠিকানাটি মুছবেন?") && run(() => addressesApi.remove(a._id))} className="text-red-500 hover:underline">মুছুন</button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="rounded-xl border border-neutral-200 p-5">
        <h2 className="mb-3 font-semibold text-neutral-800">নতুন ঠিকানা যোগ করুন</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className={input} placeholder="লেবেল (Home / Office)" value={form.label} onChange={set("label")} />
          <input required className={input} placeholder="মোবাইল নম্বর" value={form.phone} onChange={set("phone")} />
          <input required className={`${input} md:col-span-2`} placeholder="ঠিকানা (বাড়ি/রোড)" value={form.line1} onChange={set("line1")} />
          <input className={`${input} md:col-span-2`} placeholder="ঠিকানা লাইন ২ (ঐচ্ছিক)" value={form.line2} onChange={set("line2")} />
          <input required className={input} placeholder="শহর / জেলা" value={form.city} onChange={set("city")} />
          <input className={input} placeholder="এলাকা" value={form.area} onChange={set("area")} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" checked={form.isDefault} onChange={set("isDefault")} /> ডিফল্ট ঠিকানা
        </label>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <button disabled={saving} className="mt-3 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
          {saving ? "সেভ হচ্ছে..." : "ঠিকানা সেভ করুন"}
        </button>
      </form>
    </div>
  );
}

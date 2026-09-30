"use client";

import { useEffect, useState } from "react";
import { UI } from "@/lib/admin-api";
import { branchesApi } from "@/lib/content-client";

const EMPTY = { name: "", address: "", phone: "", lat: "", lng: "", hours: "১০:০০ AM – ৮:০০ PM (প্রতিদিন)" };

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => branchesApi.adminList().then(setBranches).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await branchesApi.create(form);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const toggle = (b) => branchesApi.update(b._id, { isActive: !b.isActive }).then(load).catch((e) => alert(e.message));
  const remove = (b) => window.confirm(`"${b.name}" মুছবেন?`) && branchesApi.remove(b._id).then(load).catch((e) => alert(e.message));

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">ব্রাঞ্চ / স্টোর লোকেটর</h1>

      <form onSubmit={add} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-white p-4 md:grid-cols-3">
        <input required className={UI.input} placeholder="ব্রাঞ্চের নাম" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input required className={`${UI.input} md:col-span-2`} placeholder="ঠিকানা" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        <input className={UI.input} placeholder="ফোন" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <input required type="number" step="any" className={UI.input} placeholder="Latitude" value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))} />
        <input required type="number" step="any" className={UI.input} placeholder="Longitude" value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))} />
        <input className={`${UI.input} md:col-span-3`} placeholder="খোলার সময়" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} />
        {error && <p className="text-sm text-red-500 md:col-span-3">{error}</p>}
        <button disabled={saving} className={`${UI.btn} md:col-span-3`}>{saving ? "সেভ হচ্ছে..." : "+ ব্রাঞ্চ যোগ করুন"}</button>
      </form>
      <p className="mb-4 text-xs text-neutral-400">Latitude/Longitude Google Maps-এ লোকেশনে রাইট-ক্লিক করে পাওয়া যায়।</p>

      <div className="space-y-2">
        {branches.map((b) => (
          <div key={b._id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-sm">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-neutral-800">{b.name}</div>
              <div className="text-xs text-neutral-500">{b.address}</div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${b.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{b.isActive ? "সক্রিয়" : "লুকানো"}</span>
            <button onClick={() => toggle(b)} className="text-brand hover:underline">{b.isActive ? "লুকান" : "দেখান"}</button>
            <button onClick={() => remove(b)} className="text-red-500 hover:underline">মুছুন</button>
          </div>
        ))}
        {branches.length === 0 && <p className="text-neutral-400">কোনো ব্রাঞ্চ নেই।</p>}
      </div>
    </div>
  );
}

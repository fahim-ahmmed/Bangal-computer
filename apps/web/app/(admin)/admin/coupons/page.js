"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, UI } from "@/lib/admin-api";
import { formatBDT } from "@/lib/format";

const EMPTY = { code: "", type: "percent", value: "", maxDiscount: "", minOrder: "", expiry: "" };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setCoupons((await adminFetch("/coupons")).data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await adminFetch("/coupons", { method: "POST", body: { ...form, expiry: form.expiry || null } });
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const toggle = (c) => adminFetch(`/coupons/${c._id}`, { method: "PUT", body: { isActive: !c.isActive } }).then(load).catch((e) => alert(e.message));

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">কুপন / ডিসকাউন্ট</h1>

      <form onSubmit={create} className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-white p-4 md:grid-cols-6">
        <input required className={UI.input} placeholder="কোড (যেমন EID10)" value={form.code} onChange={set("code")} />
        <select className={UI.input} value={form.type} onChange={set("type")}>
          <option value="percent">শতাংশ (%)</option>
          <option value="flat">ফ্ল্যাট (৳)</option>
        </select>
        <input required type="number" min="1" className={UI.input} placeholder={form.type === "percent" ? "শতাংশ" : "টাকা"} value={form.value} onChange={set("value")} />
        <input type="number" min="0" className={UI.input} placeholder="ন্যূনতম অর্ডার" value={form.minOrder} onChange={set("minOrder")} />
        <input type="number" min="0" className={UI.input} placeholder="সর্বোচ্চ ছাড় (৳)" value={form.maxDiscount} onChange={set("maxDiscount")} disabled={form.type !== "percent"} />
        <input type="date" className={UI.input} value={form.expiry} onChange={set("expiry")} title="মেয়াদ শেষের তারিখ" />
        <button disabled={saving} className={`${UI.btn} col-span-2 md:col-span-6`}>{saving ? "সেভ হচ্ছে..." : "কুপন তৈরি করুন"}</button>
        {error && <p className="col-span-2 text-sm text-red-500 md:col-span-6">{error}</p>}
      </form>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
            <tr><th className="p-3">কোড</th><th className="p-3">ছাড়</th><th className="p-3">ন্যূনতম অর্ডার</th><th className="p-3">মেয়াদ</th><th className="p-3">স্ট্যাটাস</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {coupons.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-neutral-400">কোনো কুপন নেই।</td></tr>}
            {coupons.map((c) => (
              <tr key={c._id} className="border-t border-neutral-100">
                <td className="p-3 font-mono font-semibold">{c.code}</td>
                <td className="p-3">{c.type === "percent" ? `${c.value}%${c.maxDiscount ? ` (সর্বোচ্চ ${formatBDT(c.maxDiscount)})` : ""}` : formatBDT(c.value)}</td>
                <td className="p-3">{c.minOrder ? formatBDT(c.minOrder) : "—"}</td>
                <td className="p-3">{c.expiry ? new Date(c.expiry).toLocaleDateString("bn-BD") : "—"}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{c.isActive ? "সক্রিয়" : "বন্ধ"}</span>
                </td>
                <td className="p-3 text-right"><button onClick={() => toggle(c)} className="text-xs text-brand hover:underline">{c.isActive ? "বন্ধ করুন" : "চালু করুন"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

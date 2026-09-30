"use client";

import { useState } from "react";
import { contactApi } from "@/lib/content-client";

const input = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";

export default function ContactForm({ type = "contact", showOrderId = false }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", orderId: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await contactApi.send({ ...form, type });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center text-green-700">
        ধন্যবাদ! আপনার বার্তা পেয়েছি, দ্রুত যোগাযোগ করা হবে।
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input required className={input} placeholder="আপনার নাম" value={form.name} onChange={set("name")} />
        <input className={input} placeholder="মোবাইল নম্বর" value={form.phone} onChange={set("phone")} />
        <input className={`${input} md:col-span-2`} type="email" placeholder="ইমেইল (ঐচ্ছিক যদি ফোন দেন)" value={form.email} onChange={set("email")} />
        {showOrderId && <input className={`${input} md:col-span-2`} placeholder="অর্ডার আইডি (থাকলে)" value={form.orderId} onChange={set("orderId")} />}
        <input className={`${input} md:col-span-2`} placeholder="বিষয়" value={form.subject} onChange={set("subject")} />
      </div>
      <textarea required rows={5} className={input} placeholder="আপনার বার্তা লিখুন" value={form.message} onChange={set("message")} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button disabled={loading} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
        {loading ? "পাঠানো হচ্ছে..." : "পাঠান"}
      </button>
    </form>
  );
}

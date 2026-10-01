"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import AuthPageShell from "@/components/AuthPageShell";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("আপনার নাম লিখুন");
      return;
    }
    if (form.password.length < 8) {
      setError("পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await authClient.signUp.email({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      if (err) {
        setError(err.message || "সাইন-আপ ব্যর্থ হয়েছে");
        return;
      }
      router.push("/account");
    } catch {
      setError("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      eyebrow="নতুন সদস্য"
      title="আপনার অ্যাকাউন্ট তৈরি করুন"
      description="কয়েকটি তথ্য দিলেই আপনার কেনাকাটা শুরু করতে পারবেন।"
      footer={
        <p className="text-center text-sm text-neutral-500">
          আগে থেকেই অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="font-bold text-brand hover:underline">লগইন করুন</Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-3.5">
        <label className="block text-sm font-semibold text-neutral-700">
          আপনার নাম
          <input type="text" value={form.name} onChange={(event) => set("name")(event.target.value)} autoComplete="name" required className="mt-2 block h-12 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-base text-neutral-900 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15" />
        </label>
        <label className="block text-sm font-semibold text-neutral-700">
          ইমেইল ঠিকানা
          <input type="email" value={form.email} onChange={(event) => set("email")(event.target.value)} autoComplete="email" required className="mt-2 block h-12 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-base text-neutral-900 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15" />
        </label>
        <label className="block text-sm font-semibold text-neutral-700">
          মোবাইল নম্বর <span className="font-normal text-neutral-400">(ঐচ্ছিক)</span>
          <input type="tel" value={form.phone} onChange={(event) => set("phone")(event.target.value)} autoComplete="tel" className="mt-2 block h-12 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-base text-neutral-900 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15" />
        </label>
        <label className="block text-sm font-semibold text-neutral-700">
          পাসওয়ার্ড <span className="font-normal text-neutral-400">(কমপক্ষে ৮ অক্ষর)</span>
          <input type="password" value={form.password} onChange={(event) => set("password")(event.target.value)} autoComplete="new-password" minLength={8} required className="mt-2 block h-12 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-base text-neutral-900 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15" />
        </label>
        {error && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">{error}</p>}
        <Button type="submit" color="danger" radius="sm" className="w-full font-bold" isLoading={loading} isDisabled={loading}>
          অ্যাকাউন্ট তৈরি করুন
        </Button>
        <p className="text-center text-xs leading-5 text-neutral-400">
          সাইন আপ করলে আপনার তথ্য সুরক্ষিতভাবে অ্যাকাউন্টে সংরক্ষিত হবে।
        </p>
      </form>
    </AuthPageShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
    });
    setLoading(false);
    if (err) {
      setError(err.message || "সাইন-আপ ব্যর্থ হয়েছে");
      return;
    }
    router.push("/account");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold text-neutral-900">নতুন অ্যাকাউন্ট খুলুন</h1>
      <form onSubmit={submit} className="space-y-3">
        <Input label="আপনার নাম" value={form.name} onValueChange={set("name")} isRequired />
        <Input type="email" label="ইমেইল" value={form.email} onValueChange={set("email")} isRequired />
        <Input label="মোবাইল নম্বর" value={form.phone} onValueChange={set("phone")} />
        <Input type="password" label="পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" value={form.password} onValueChange={set("password")} isRequired />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" color="danger" radius="sm" className="w-full" isLoading={loading}>
          সাইন-আপ করুন
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-500">
        আগে থেকেই অ্যাকাউন্ট আছে?{" "}
        <Link href="/login" className="text-brand hover:underline">লগইন করুন</Link>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়, অথবা এই অ্যাকাউন্টে অ্যাডমিন অ্যাক্সেস নেই।");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center bg-neutral-950 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl sm:p-9">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-neutral-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg text-white">B</span>
          BANGAL COMPUTER
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-red-400">সুরক্ষিত প্রবেশ</p>
        <h1 className="mt-2 text-2xl font-extrabold text-white">অ্যাডমিন লগইন</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          অনুমোদিত অ্যাডমিন অ্যাকাউন্টের ইমেইল ও পাসওয়ার্ড ব্যবহার করুন।
        </p>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block text-sm font-semibold text-neutral-300">
            অ্যাডমিন ইমেইল
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              className="mt-2 block h-12 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 text-base text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </label>
          <label className="block text-sm font-semibold text-neutral-300">
            পাসওয়ার্ড
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 block h-12 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 text-base text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </label>
          {error && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/60 px-3 py-2.5 text-sm leading-5 text-red-200">{error}</p>}
          <Button type="submit" color="danger" radius="sm" className="w-full font-bold" isLoading={loading} isDisabled={loading}>
            অ্যাডমিন প্যানেলে প্রবেশ
          </Button>
        </form>

        <div className="mt-6 border-t border-neutral-800 pt-5 text-center">
          <Link href="/login" className="text-xs font-medium text-neutral-400 transition-colors hover:text-white">
            সাধারণ ব্যবহারকারীর লগইন
          </Link>
        </div>
      </section>
    </div>
  );
}

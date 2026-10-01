"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import AuthPageShell from "@/components/AuthPageShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authClient.signIn.email({ email: email.trim(), password });
      if (err) {
        setError(err.message || "লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড যাচাই করুন।");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function signInWith(provider) {
    setError(null);
    setSocialLoading(provider);
    try {
      const { error: err } = await authClient.signIn.social({ provider });
      if (err) setError(err.message || "সোশ্যাল লগইন চালু করা যায়নি।");
    } catch {
      setError("সোশ্যাল লগইন চালু করা যায়নি। ইমেইল ও পাসওয়ার্ড দিয়ে চেষ্টা করুন।");
    } finally {
      setSocialLoading("");
    }
  }

  return (
    <AuthPageShell
      eyebrow="স্বাগতম"
      title="আপনার অ্যাকাউন্টে লগইন করুন"
      description="আপনার অর্ডার, ঠিকানা ও পছন্দের পণ্য দেখতে তথ্য দিন।"
      footer={
        <div className="space-y-3 text-center">
          <p className="text-sm text-neutral-500">
            অ্যাকাউন্ট নেই?{" "}
            <Link href="/signup" className="font-bold text-brand hover:underline">নতুন অ্যাকাউন্ট খুলুন</Link>
          </p>
          <Link href="/admin/login" className="text-xs text-neutral-400 transition-colors hover:text-neutral-600">
            প্রশাসনিক প্রবেশ
          </Link>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold text-neutral-700">
          ইমেইল ঠিকানা
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="mt-2 block h-12 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-base text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <label className="block text-sm font-semibold text-neutral-700">
          পাসওয়ার্ড
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="mt-2 block h-12 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-base text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        {error && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">{error}</p>}
        <Button type="submit" color="danger" radius="sm" className="w-full font-bold" isLoading={loading} isDisabled={loading || !!socialLoading}>
          লগইন করুন
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs font-medium text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" /> অথবা <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="bordered" radius="sm" className="w-full font-semibold" isLoading={socialLoading === "google"} isDisabled={loading || (!!socialLoading && socialLoading !== "google")} onPress={() => signInWith("google")}>
          Google দিয়ে চালিয়ে যান
        </Button>
        <Button variant="bordered" radius="sm" className="w-full font-semibold" isLoading={socialLoading === "facebook"} isDisabled={loading || (!!socialLoading && socialLoading !== "facebook")} onPress={() => signInWith("facebook")}>
          Facebook দিয়ে চালিয়ে যান
        </Button>
      </div>
      <p className="mt-4 text-center text-xs leading-5 text-neutral-400">
        সোশ্যাল লগইন কাজ না করলে ইমেইল ও পাসওয়ার্ড ব্যবহার করুন।
      </p>
    </AuthPageShell>
  );
}

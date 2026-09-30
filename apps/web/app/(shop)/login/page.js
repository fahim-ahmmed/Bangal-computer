"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message || "লগইন ব্যর্থ হয়েছে");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold text-neutral-900">লগইন করুন</h1>

      <form onSubmit={submit} className="space-y-3">
        <Input type="email" label="ইমেইল" value={email} onValueChange={setEmail} isRequired />
        <Input type="password" label="পাসওয়ার্ড" value={password} onValueChange={setPassword} isRequired />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" color="danger" radius="sm" className="w-full" isLoading={loading}>
          লগইন
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-neutral-400">
        <div className="flex-1 border-t border-neutral-200" /> অথবা <div className="flex-1 border-t border-neutral-200" />
      </div>

      <div className="space-y-2">
        <Button variant="bordered" radius="sm" className="w-full" onClick={() => authClient.signIn.social({ provider: "google" })}>
          Google দিয়ে চালিয়ে যান
        </Button>
        <Button variant="bordered" radius="sm" className="w-full" onClick={() => authClient.signIn.social({ provider: "facebook" })}>
          Facebook দিয়ে চালিয়ে যান
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        অ্যাকাউন্ট নেই?{" "}
        <Link href="/signup" className="text-brand hover:underline">সাইন-আপ করুন</Link>
      </p>
    </div>
  );
}

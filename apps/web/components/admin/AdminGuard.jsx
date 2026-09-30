"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

/** Only admin/staff may see the admin panel (the API enforces this again on every request). */
export default function AdminGuard({ children }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="p-16 text-center text-neutral-400">লোড হচ্ছে...</div>;
  }

  if (!session?.user) {
    return (
      <div className="p-16 text-center">
        <p className="mb-3 text-neutral-600">অ্যাডমিন প্যানেল দেখতে লগইন করুন।</p>
        <Link href="/login" className="text-brand hover:underline">
          লগইন করুন →
        </Link>
      </div>
    );
  }

  if (!["admin", "staff"].includes(session.user.role)) {
    return (
      <div className="mx-auto max-w-lg p-16 text-center">
        <p className="mb-2 font-semibold text-neutral-800">এই পেজে আপনার অনুমতি নেই</p>
        <p className="text-sm text-neutral-500">
          প্রথম অ্যাডমিন বানাতে টার্মিনালে চালান: <code>npm run make-admin -- আপনার@ইমেইল</code> — তারপর লগআউট করে আবার লগইন করুন।
        </p>
        <Link href="/" className="mt-4 inline-block text-brand hover:underline">
          হোমে ফিরুন
        </Link>
      </div>
    );
  }

  return children;
}

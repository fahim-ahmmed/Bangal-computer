import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="text-6xl font-bold text-neutral-200">৪০৪</div>
      <h1 className="mt-4 text-xl font-bold text-neutral-900">পেজটি খুঁজে পাওয়া যায়নি</h1>
      <p className="mt-2 text-sm text-neutral-500">লিংকটি হয়তো পুরনো বা ভুল, অথবা প্রোডাক্টটি আর নেই।</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
        হোমপেজে ফিরে যান
      </Link>
    </div>
  );
}

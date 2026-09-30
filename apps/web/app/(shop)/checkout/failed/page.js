import Link from "next/link";

export default function CheckoutFailedPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">পেমেন্ট সম্পন্ন হয়নি</h1>
      <p className="text-neutral-600 mb-6">
        পেমেন্ট বাতিল বা ব্যর্থ হয়েছে, আপনার কাছ থেকে কোনো টাকা কাটা হয়নি বলেই ধরা হচ্ছে। কার্টের প্রোডাক্ট
        অক্ষত আছে — আবার চেষ্টা করতে পারেন বা ক্যাশ অন ডেলিভারি বেছে নিতে পারেন।
      </p>
      <Link href="/checkout" className="text-brand hover:underline">
        আবার চেকআউটে যান →
      </Link>
    </div>
  );
}

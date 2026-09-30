"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { wishlistApi } from "@/lib/wishlist-client";
import ProductGrid from "@/components/ProductGrid";

export default function WishlistPage() {
  const { data: session, isPending } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    wishlistApi
      .get()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [session]);

  if (isPending || loading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-neutral-400">লোড হচ্ছে...</div>;
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">উইশলিস্ট দেখতে হলে লগইন করুন।</p>
        <Link href="/login" className="text-brand hover:underline">
          লগইন করুন →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">আমার উইশলিস্ট</h1>
      <ProductGrid products={products} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { formatBDT } from "@/lib/format";
import { useCompare } from "@/context/CompareContext";

export default function ProductCard({ product }) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const outOfStock = (product.stock ?? 0) <= 0 && (!product.variants || product.variants.length === 0);
  const { toggle, isInCompare } = useCompare();
  const inCompare = isInCompare(product._id);

  function handleCompareClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const result = toggle(product);
    if (result.limitReached) alert("একসাথে সর্বোচ্চ ৪টি প্রোডাক্ট তুলনা করা যাবে");
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden hover:border-brand hover:shadow-md transition-all"
    >
      <div className="relative aspect-square bg-neutral-100 flex items-center justify-center overflow-hidden">
        <label
          className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[11px] text-neutral-600 shadow-sm cursor-pointer"
          onClick={handleCompareClick}
        >
          <input type="checkbox" checked={inCompare} readOnly className="h-3 w-3" />
          তুলনা
        </label>
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform"
          />
        ) : (
          <span className="text-neutral-300 text-sm">ছবি নেই</span>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded bg-brand px-2 py-0.5 text-xs font-semibold text-white">
            {Math.round(100 - (product.discountPrice / product.price) * 100)}% ছাড়
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-2 right-2 rounded bg-neutral-800/80 px-2 py-0.5 text-xs font-semibold text-white">
            স্টক নেই
          </span>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        {product.brandId?.name && (
          <span className="text-xs text-neutral-400 mb-0.5">{product.brandId.name}</span>
        )}
        <h3 className="text-sm font-medium text-neutral-800 line-clamp-2 flex-1">{product.title}</h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-brand font-bold">{formatBDT(hasDiscount ? product.discountPrice : product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">{formatBDT(product.price)}</span>
          )}
        </div>

        {product.rating?.count > 0 && (
          <div className="mt-1 text-xs text-amber-500">
            ★ {product.rating.avg.toFixed(1)} ({product.rating.count})
          </div>
        )}
      </div>
    </Link>
  );
}

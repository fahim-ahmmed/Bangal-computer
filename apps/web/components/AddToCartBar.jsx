"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCartIcon, HeartIcon, BoltIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

export default function AddToCartBar({ product, inStock }) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addItem } = useCart();
  const router = useRouter();

  // ১. কার্টে রাখুন (Add to Cart)
  const handleAddToCart = async () => {
    if (!inStock || !addItem || adding) return;
    setAdding(true);
    try {
      await addItem(product._id, null, qty);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setAdding(false);
    }
  };

  // ২. এখনই কিনুন (Buy Now) - মূল কার্ট অক্ষুণ্ণ রেখে শুধু এই প্রোডাক্টটি নিয়ে চেকআউটে যাবে
  const handleBuyNow = () => {
    if (!inStock) return;

    const buyNowItem = {
      productId: product._id,
      title: product.title,
      slug: product.slug,
      image: product.images?.[0] || "",
      unitPrice: product.discountPrice || product.price,
      qty: qty,
      lineTotal: (product.discountPrice || product.price) * qty,
    };

    // ব্রাউজারের সেশনে সেভ করে চেকআউটে পাঠানো
    sessionStorage.setItem("bangal_buynow_item", JSON.stringify(buyNowItem));
    router.push("/checkout?mode=buynow");
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 mt-4 w-full">
      
      {/* কোয়ান্টিটি সিলেক্টর */}
      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white h-12 sm:h-[52px] shadow-sm shrink-0 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-red-600 font-black text-xl transition-colors disabled:opacity-50"
          disabled={!inStock || adding}
        >
          −
        </button>
        <span className="flex-1 sm:w-12 h-full flex items-center justify-center font-extrabold text-gray-900 border-x border-gray-100 text-lg bg-gray-50/50">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-emerald-600 font-black text-xl transition-colors disabled:opacity-50"
          disabled={!inStock || adding}
        >
          +
        </button>
      </div>

      <div className="flex w-full sm:flex-1 gap-3 sm:gap-4">
        {/* কার্টে রাখুন বাটন */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || adding}
          className={`flex-1 h-12 sm:h-[52px] flex items-center justify-center gap-2 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-sm border-2 cursor-pointer ${
            inStock
              ? "border-red-600 text-red-600 bg-red-50/50 hover:bg-red-600 hover:text-white"
              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        >
          <ShoppingCartIcon className="w-5 h-5" />
          <span>{adding ? "যোগ হচ্ছে..." : inStock ? "কার্টে রাখুন" : "স্টকে নেই"}</span>
        </button>

        {/* এখনই কিনুন বাটন */}
        {inStock && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 h-12 sm:h-[52px] flex items-center justify-center gap-2 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-md bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 border-2 border-red-600 cursor-pointer"
          >
            <BoltIcon className="w-5 h-5" />
            <span>এখনই কিনুন</span>
          </button>
        )}

        {/* উইশলিস্ট বাটন */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={`h-12 sm:h-[52px] px-3 sm:px-4 flex items-center justify-center rounded-xl border-2 transition-all duration-300 shadow-sm shrink-0 cursor-pointer ${
            isWishlisted
              ? "border-red-600 bg-red-50 text-red-600"
              : "border-gray-200 bg-white text-gray-500 hover:border-red-600 hover:text-red-600 hover:bg-red-50/50"
          }`}
          title="উইশলিস্টে রাখুন"
        >
          {isWishlisted ? (
            <HeartSolidIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>
      </div>
      
    </div>
  );
}
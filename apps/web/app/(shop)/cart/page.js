"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatBDT } from "@/lib/format";
import { TrashIcon, ShoppingBagIcon, ShieldCheckIcon, TruckIcon } from "@heroicons/react/24/outline";

export default function CartPage() {
  const { cart, loading, updateQty, removeItem } = useCart();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-gray-600">কার্ট আপডেট হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fa] flex items-center justify-center px-4 py-16">
        <div className="text-center bg-white p-10 lg:p-14 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBagIcon className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">আপনার শপিং কার্ট খালি!</h1>
          <p className="text-gray-500 mb-8 leading-relaxed text-sm">
            আপনি এখনো কোনো পণ্য কার্টে যুক্ত করেননি। আমাদের লেটেস্ট প্রযুক্তি পণ্যগুলো দেখতে কেনাকাটা শুরু করুন।
          </p>
          <Link 
            href="/" 
            className="inline-block w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-8 rounded-xl transition shadow-md hover:shadow-lg"
          >
            কেনাকাটা শুরু করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm tracking-wider uppercase mb-1">
              <ShoppingBagIcon className="w-5 h-5" />
              আপনার শপিং ব্যাগ
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              কার্ট রিভিউ <span className="text-gray-400 font-medium text-lg ml-2">({cart.itemCount}টি পণ্য)</span>
            </h1>
          </div>
          <Link 
            href="/" 
            className="text-sm font-semibold text-gray-600 hover:text-red-600 transition flex items-center gap-1.5"
          >
            <span aria-hidden="true">←</span> আরও কেনাকাটা করুন
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <section className="lg:col-span-8 space-y-4">
            <div className="hidden sm:grid grid-cols-12 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wide">
              <div className="col-span-6 pl-2">প্রোডাক্ট</div>
              <div className="col-span-2 text-center">মূল্য</div>
              <div className="col-span-2 text-center">পরিমাণ</div>
              <div className="col-span-2 text-right pr-2">মোট</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {/* Fix: Added index to key to prevent React duplicate key errors */}
              {cart.items.map((item, index) => (
                <div 
                  key={`${item.productId}-${item.variantId || "base"}-${index}`} 
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 sm:p-5 transition hover:bg-gray-50/50"
                >
                  <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-gray-300 hover:text-red-500 transition p-1.5 shrink-0 bg-white border border-gray-200 hover:border-red-200 rounded-lg shadow-sm"
                      title="কার্ট থেকে মুছুন"
                    >
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    
                    <Link href={`/product/${item.slug}`} className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center p-2 shrink-0 group">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="max-h-full object-contain group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-[10px] text-gray-400">No Image</span>
                      )}
                    </Link>
                    
                    <div className="flex flex-col min-w-0">
                      <Link href={`/product/${item.slug}`} className="font-bold text-gray-800 hover:text-red-600 transition text-sm sm:text-base line-clamp-2 leading-snug">
                        {item.title}
                      </Link>
                      {item.variantName && (
                        <span className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 px-2 py-0.5 rounded w-max">
                          {item.variantName}
                        </span>
                      )}
                      <span className="sm:hidden text-red-600 font-bold text-sm mt-1">{formatBDT(item.unitPrice)}</span>
                    </div>
                  </div>

                  <div className="col-span-2 text-center font-bold text-gray-600 hidden sm:block">
                    {formatBDT(item.unitPrice)}
                  </div>

                  <div className="col-span-1 sm:col-span-2 flex justify-center mt-2 sm:mt-0">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm w-max">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1), item.variantId)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-red-600 transition font-bold"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900 border-x border-gray-100 h-8 flex items-center justify-center">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.qty + 1, item.variantId)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-green-600 transition font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 sm:text-right font-extrabold text-gray-900 text-lg sm:text-base flex justify-between items-center sm:block mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                    <span className="sm:hidden text-gray-500 font-normal text-sm">মোট: </span>
                    {formatBDT(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-7">
              <h2 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-100 mb-5">
                অর্ডার সারাংশ
              </h2>

              <div className="space-y-3.5 text-sm text-gray-600 mb-6">
                <div className="flex justify-between items-center">
                  <span>মোট পণ্য</span>
                  <span className="font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">{cart.itemCount}টি</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-gray-900">{formatBDT(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">চেকআউটে যুক্ত হবে</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mb-6 flex justify-between items-center bg-red-50/50 -mx-6 px-6 py-4">
                <span className="text-base font-bold text-gray-900">সর্বমোট (আনুমানিক)</span>
                <span className="text-2xl font-extrabold text-red-600">{formatBDT(cart.subtotal)}</span>
              </div>

              <Button 
                color="danger" 
                radius="sm" 
                className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition"
                onClick={() => router.push("/checkout")}
              >
                নিরাপদ চেকআউট <span aria-hidden="true" className="ml-1">→</span>
              </Button>

              <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                  ১০০% নিরাপদ ও এনক্রিপ্টেড পেমেন্ট
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <TruckIcon className="w-5 h-5 text-blue-600" />
                  সারা বাংলাদেশে দ্রুত হোম ডেলিভারি
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
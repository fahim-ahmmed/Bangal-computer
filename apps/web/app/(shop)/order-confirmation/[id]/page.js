"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/orders-client";
import { formatBDT } from "@/lib/format";

const METHOD_LABEL = { cod: "ক্যাশ অন ডেলিভারি", bkash: "bKash", nagad: "Nagad", card: "কার্ড" };
const STATUS_LABEL = {
  pending: "অপেক্ষমাণ",
  confirmed: "কনফার্মড",
  shipped: "শিপড",
  delivered: "ডেলিভারড",
  returned: "রিটার্নড",
  cancelled: "বাতিল",
};

export default function OrderConfirmationPage({ params }) {
  const { id } = use(params);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    ordersApi.get(id).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-red-500">{error}</div>;
  }
  if (!order) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-neutral-400">লোড হচ্ছে...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center mb-8">
        <h1 className="text-2xl font-bold text-green-700 mb-1">ধন্যবাদ! আপনার অর্ডার গ্রহণ করা হয়েছে</h1>
        <p className="text-sm text-neutral-600">অর্ডার আইডি: {order._id}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 p-5 space-y-4">
        <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm text-neutral-600">
          <span>স্ট্যাটাস: <b className="text-neutral-900">{STATUS_LABEL[order.status]}</b></span>
          <span>পেমেন্ট: <b className="text-neutral-900">{METHOD_LABEL[order.paymentMethod]}</b> ({order.paymentStatus === "paid" ? "পরিশোধিত" : "বাকি"})</span>
        </div>

        <ul className="divide-y divide-neutral-100">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between py-2 text-sm">
              <span className="text-neutral-700">{i.title} × {i.qty}</span>
              <span>{formatBDT(i.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="text-sm space-y-1">
          <div className="flex justify-between text-neutral-600"><span>সাবটোটাল</span><span>{formatBDT(order.subtotal)}</span></div>
          <div className="flex justify-between text-neutral-600"><span>ডেলিভারি চার্জ</span><span>{formatBDT(order.shippingFee)}</span></div>
          <div className="flex justify-between font-bold text-neutral-900"><span>মোট</span><span>{formatBDT(order.total)}</span></div>
        </div>

        <div className="text-sm text-neutral-600 border-t border-neutral-100 pt-3">
          <div className="font-medium text-neutral-800 mb-1">ডেলিভারি ঠিকানা</div>
          {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, {order.shippingAddress.area ? `${order.shippingAddress.area}, ` : ""}{order.shippingAddress.city}
          <br />ফোন: {order.shippingAddress.phone}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-brand hover:underline">আরও কেনাকাটা করুন →</Link>
      </div>
    </div>
  );
}

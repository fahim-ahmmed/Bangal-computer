"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { ordersApi, addressesApi, couponsApi } from "@/lib/orders-client";
import { formatBDT } from "@/lib/format";
import { 
  ShieldCheckIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

const PAYMENT_METHODS = [
  { value: "cod", label: "ক্যাশ অন ডেলিভারি", desc: "পণ্য হাতে পেয়ে টাকা দিন", icon: BanknotesIcon },
  { value: "bkash", label: "bKash", desc: "বিকাশ নাম্বারে সেন্ড মানি করুন", icon: DevicePhoneMobileIcon },
  { value: "nagad", label: "Nagad", desc: "নগদ নাম্বারে সেন্ড মানি করুন", icon: DevicePhoneMobileIcon },
  { value: "card", label: "ক্রেডিট/ডেবিট কার্ড", desc: "ভিসা, মাস্টারকার্ড বা অন্যান্য", icon: CreditCardIcon },
];

const EMPTY_ADDRESS = { name: "", label: "Home", line1: "", line2: "", city: "", area: "", phone: "" };

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading, refresh } = useCart();
  const { data: session } = useSession();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [guestEmail, setGuestEmail] = useState("");
  const [saved, setSaved] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Buy Now state management
  const [buyNowData, setBuyNowData] = useState(null);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);

  // Mobile Banking Fields
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");

  useEffect(() => {
    // Check if coming from Buy Now
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "buynow") {
      const storedItem = sessionStorage.getItem("bangal_buynow_item");
      if (storedItem) {
        try {
          const item = JSON.parse(storedItem);
          setBuyNowData(item);
          setIsBuyNowMode(true);
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (!session?.user) return;
    addressesApi
      .list()
      .then((list) => {
        setSaved(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setAddress({ ...EMPTY_ADDRESS, name: session.user.name || "", ...def });
      })
      .catch(() => {});
  }, [session]);

  const handleField = (key) => (e) => {
    const val = e?.target ? e.target.value : e;
    setAddress((a) => ({ ...a, [key]: val }));
  };
  
  const shippingPreview = 120; 

  // Active items and subtotal calculation based on mode
  const activeItems = isBuyNowMode && buyNowData ? [buyNowData] : cart.items;
  const activeSubtotal = isBuyNowMode && buyNowData ? buyNowData.lineTotal : cart.subtotal;

  async function applyCoupon() {
    setCouponMsg(null);
    try {
      const result = await couponsApi.validate(couponInput, activeSubtotal);
      setCoupon(result);
      setCouponMsg({ ok: true, text: `কুপন প্রয়োগ হয়েছে: ${formatBDT(result.discount)} ছাড়` });
    } catch (err) {
      setCoupon(null);
      setCouponMsg({ ok: false, text: err.message });
    }
  }

  const discount = coupon ? Math.min(coupon.discount, activeSubtotal) : 0;
  const totalAmountToPay = activeSubtotal - discount + shippingPreview;

  async function placeOrder(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && (!senderNumber || !trxId)) {
      setError("অনুগ্রহ করে যে নম্বর থেকে টাকা পাঠিয়েছেন এবং ট্রানজেকশন আইডি (TrxID) প্রদান করুন।");
      setSubmitting(false);
      return;
    }

    try {
      const { _id, id, ...shippingAddress } = address;
      
      const payload = {
        shippingAddress,
        paymentMethod,
        senderNumber: (paymentMethod === "bkash" || paymentMethod === "nagad") ? senderNumber : undefined,
        trxId: (paymentMethod === "bkash" || paymentMethod === "nagad") ? trxId : undefined,
        couponCode: coupon?.code,
        guestEmail: session?.user ? undefined : guestEmail || undefined,
        saveAddress: Boolean(session?.user && saveAddress),
      };

      // If Buy Now mode, send specific items array to backend
      if (isBuyNowMode && buyNowData) {
        payload.items = [{
          productId: buyNowData.productId,
          qty: buyNowData.qty,
          price: buyNowData.unitPrice
        }];
      }

      const result = await ordersApi.create(payload);

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      
      if (isBuyNowMode) {
        sessionStorage.removeItem("bangal_buynow_item");
      } else {
        await refresh();
      }

      router.push(`/order-confirmation/${result.order._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (loading && !isBuyNowMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-neutral-400 bg-[#f8f9fa]">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-gray-600">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!isBuyNowMode && cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-16">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-4">
          <ShoppingBagIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">আপনার কার্ট খালি!</h2>
          <p className="text-neutral-500 mb-8">চেকআউট করার জন্য প্রথমে কার্টে কিছু পণ্য যোগ করুন।</p>
          <Link href="/" className="inline-block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md">
            কেনাকাটা শুরু করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheckIcon className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">নিরাপদ চেকআউট</h1>
        </div>

        <form onSubmit={placeOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* বাম পাশ: ডেলিভারি ও পেমেন্ট */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. ডেলিভারি ঠিকানা */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 lg:px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                <span className="bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                <h2 className="text-xl font-extrabold text-gray-900">ডেলিভারি ঠিকানা</h2>
              </div>
              
              <div className="p-6 lg:p-8">
                {!session?.user && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                    <InformationCircleIcon className="w-6 h-6 shrink-0 mt-0.5 text-blue-600" />
                    <p>
                      আপনি গেস্ট হিসেবে অর্ডার করছেন। <Link href="/login" className="font-bold underline hover:text-blue-900">লগইন করলে</Link> সেভ করা ঠিকানা ও অর্ডার হিস্ট্রি দেখতে পাবেন।
                    </p>
                  </div>
                )}

                {saved.length > 0 && !isBuyNowMode && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-800 mb-2">সেভ করা ঠিকানা নির্বাচন করুন</label>
                    <select
                      className={inputClass}
                      onChange={(e) => {
                        const a = saved.find((s) => s._id === e.target.value);
                        setAddress(a ? { ...EMPTY_ADDRESS, ...a } : EMPTY_ADDRESS);
                      }}
                      defaultValue={(saved.find((a) => a.isDefault) || saved[0])?._id}
                    >
                      {saved.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.label || "ঠিকানা"} — {a.line1}, {a.city}
                        </option>
                      ))}
                      <option value="">+ নতুন ঠিকানা যোগ করুন</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      আপনার নাম <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address.name || ""}
                      onChange={handleField("name")}
                      placeholder="সম্পূর্ণ নাম লিখুন"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      মোবাইল নম্বর <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={handleField("phone")}
                      placeholder="01XXXXXXXXX"
                      className={inputClass}
                    />
                  </div>

                  {!session?.user ? (
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        ইমেইল <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span>
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className={inputClass}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        ঠিকানার ধরন <span className="text-gray-400 font-normal">(যেমন: বাসা / অফিস)</span>
                      </label>
                      <input
                        type="text"
                        value={address.label || ""}
                        onChange={handleField("label")}
                        placeholder="Home / Office"
                        className={inputClass}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      শহর / জেলা <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={handleField("city")}
                      placeholder="যেমন: ঢাকা"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      এলাকা / থানা
                    </label>
                    <input
                      type="text"
                      value={address.area || ""}
                      onChange={handleField("area")}
                      placeholder="যেমন: ধানমন্ডি"
                      className={inputClass}
                    />
                  </div>

                  
                </div>

                {session?.user && (
                  <label className="mt-6 inline-flex items-center gap-2.5 text-sm font-bold text-gray-700 cursor-pointer bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                    />
                    ভবিষ্যতের জন্য এই ঠিকানা সেভ করুন
                  </label>
                )}
              </div>
            </section>

            {/* 2. পেমেন্ট মেথড */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 lg:px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                <span className="bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                <h2 className="text-xl font-extrabold text-gray-900">পেমেন্ট মেথড</h2>
              </div>
              
              <div className="p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.value;
                    return (
                      <label key={m.value} className="cursor-pointer">
                        <input type="radio" name="payment" className="peer sr-only" checked={isSelected} onChange={() => setPaymentMethod(m.value)} />
                        <div className={`rounded-xl border-2 p-4 transition flex items-start gap-4 h-full ${
                          isSelected ? "border-red-600 bg-red-50/70 shadow-sm" : "border-gray-200 hover:border-red-200 bg-white"
                        }`}>
                          <div className={`mt-0.5 ${isSelected ? "text-red-600" : "text-gray-500"}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className={`font-bold text-sm sm:text-base ${isSelected ? "text-red-900" : "text-gray-900"}`}>{m.label}</div>
                            <div className={`text-xs mt-1 ${isSelected ? "text-red-700" : "text-gray-500"}`}>{m.desc}</div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* বিকাশ / নগদ ম্যানুয়াল পেমেন্ট বক্স */}
                {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
                  <div className="mt-6 bg-[#fff8f5] border-2 border-orange-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex gap-3 mb-5 items-start">
                      <InformationCircleIcon className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-base mb-1">
                          {paymentMethod === "bkash" ? "বিকাশ" : "নগদ"} সেন্ড মানি নির্দেশনা
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          অনুগ্রহ করে আপনার {paymentMethod === "bkash" ? "বিকাশ" : "নগদ"} অ্যাপ থেকে{" "}
                          <strong className="text-red-600 px-2 py-0.5 text-base tracking-wider bg-red-100 rounded-md font-extrabold select-all">
                            01305470835
                          </strong>{" "}
                          নম্বরে সর্বমোট{" "}
                          <strong className="text-red-600 font-extrabold text-base">
                            {formatBDT(totalAmountToPay)}
                          </strong>{" "}
                          সেন্ড মানি (Personal) করুন। এরপর নিচের বক্সে আপনার নম্বর ও TrxID দিন:
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 sm:p-5 rounded-xl border border-orange-200">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          যে নম্বর থেকে টাকা পাঠিয়েছেন <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="01XXXXXXXXX"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          ট্রানজেকশন আইডি (TrxID) <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদাহরণ: 8H7C2JD..."
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          className={`${inputClass} uppercase`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ডান পাশ: অর্ডার সামারি (Sticky) */}
          <aside className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-7">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4 pb-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingBagIcon className="w-5 h-5 text-red-600" />
                অর্ডার সারাংশ
              </h2>

              {/* কুপন ইনপুট */}
              <div className="mb-6 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="প্রোমো কোড (যদি থাকে)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition whitespace-nowrap"
                  >
                    প্রয়োগ
                  </button>
                </div>
                {couponMsg && (
                  <p className={`mt-2 text-xs font-bold flex items-center gap-1 ${couponMsg.ok ? "text-emerald-600" : "text-red-500"}`}>
                    {couponMsg.ok ? "✓ " : "✕ "}{couponMsg.text}
                  </p>
                )}
              </div>

              {/* আইটেম লিস্ট */}
              <div className="max-h-[240px] overflow-y-auto pr-2 space-y-3 mb-6">
                {activeItems.map((i, index) => (
                  <div key={`${i.productId || i.product}-${index}`} className="flex justify-between items-start gap-3 text-sm">
                    <span className="text-gray-700 font-medium leading-snug">
                      {i.title} <span className="text-gray-400 font-normal">× {i.qty}</span>
                    </span>
                    <span className="text-gray-900 font-bold whitespace-nowrap">{formatBDT(i.lineTotal || (i.unitPrice * i.qty))}</span>
                  </div>
                ))}
              </div>

              {/* বিলিং হিসাব */}
              <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-gray-900">{formatBDT(activeSubtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-2 py-1.5 -mx-2 rounded">
                    <span>ছাড় (কুপন: {coupon.code})</span>
                    <span>− {formatBDT(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-bold text-gray-900">
                    {formatBDT(shippingPreview)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mb-6 flex justify-between items-center bg-red-50 -mx-6 px-6 py-4">
                <span className="text-base font-extrabold text-red-900">সর্বমোট পেয়</span>
                <span className="text-2xl font-black text-red-600">{formatBDT(totalAmountToPay)}</span>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-xl flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-extrabold h-12 sm:h-14 text-base rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? "প্রসেস হচ্ছে..." : paymentMethod === "cod" ? "অর্ডার কনফার্ম করুন" : "পেমেন্ট ও অর্ডার নিশ্চিত করুন"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                আপনার তথ্য ১০০% সুরক্ষিত এবং এনক্রিপ্টেড
              </div>
            </div>
          </aside>

        </form>
      </div>
    </div>
  );
}
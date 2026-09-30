"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { ordersApi, addressesApi, couponsApi } from "@/lib/orders-client";
import { formatBDT } from "@/lib/format";

const PAYMENT_METHODS = [
  { value: "cod", label: "ক্যাশ অন ডেলিভারি" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "card", label: "ক্রেডিট/ডেবিট কার্ড" },
];

const EMPTY_ADDRESS = { label: "Home", line1: "", line2: "", city: "", area: "", phone: "" };

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
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [couponMsg, setCouponMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user) return;
    addressesApi
      .list()
      .then((list) => {
        setSaved(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setAddress({ ...EMPTY_ADDRESS, ...def });
      })
      .catch(() => {});
  }, [session]);

  const set = (key) => (value) => setAddress((a) => ({ ...a, [key]: value }));

  // Shipping is calculated on the server; this is only a preview using the same rule.
  const shippingPreview = address.city.toLowerCase().includes("dhaka") ? 60 : address.city ? 120 : 0;

  async function applyCoupon() {
    setCouponMsg(null);
    try {
      const result = await couponsApi.validate(couponInput, cart.subtotal);
      setCoupon(result);
      setCouponMsg({ ok: true, text: `কুপন প্রয়োগ হয়েছে: ${formatBDT(result.discount)} ছাড়` });
    } catch (err) {
      setCoupon(null);
      setCouponMsg({ ok: false, text: err.message });
    }
  }

  const discount = coupon ? Math.min(coupon.discount, cart.subtotal) : 0;

  async function placeOrder(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { _id, id, ...shippingAddress } = address; // drop saved-address ids
      const result = await ordersApi.create({
        shippingAddress,
        paymentMethod,
        couponCode: coupon?.code,
        guestEmail: session?.user ? undefined : guestEmail || undefined,
        saveAddress: Boolean(session?.user && saveAddress),
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl; // bKash/Nagad/Card hosted checkout
        return;
      }
      await refresh();
      router.push(`/order-confirmation/${result.order._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-neutral-400">লোড হচ্ছে...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">কার্ট খালি — চেকআউট করার মতো কিছু নেই।</p>
        <Link href="/" className="text-brand hover:underline">
          কেনাকাটা শুরু করুন →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">চেকআউট</h1>

      <form onSubmit={placeOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-xl border border-neutral-200 p-5">
            <h2 className="font-semibold text-neutral-800 mb-3">ডেলিভারি ঠিকানা</h2>

            {!session?.user && (
              <p className="mb-3 text-sm text-neutral-500">
                গেস্ট হিসেবে অর্ডার করছেন।{" "}
                <Link href="/login" className="text-brand hover:underline">
                  লগইন করলে
                </Link>{" "}
                সেভ করা ঠিকানা ও অর্ডার হিস্ট্রি পাবেন।
              </p>
            )}

            {saved.length > 0 && (
              <select
                className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
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
                <option value="">নতুন ঠিকানা লিখুন</option>
              </select>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="ঠিকানা (বাড়ি/রোড)" value={address.line1} onValueChange={set("line1")} isRequired className="md:col-span-2" />
              <Input label="ঠিকানা লাইন ২ (ঐচ্ছিক)" value={address.line2 || ""} onValueChange={set("line2")} className="md:col-span-2" />
              <Input label="শহর / জেলা" value={address.city} onValueChange={set("city")} isRequired />
              <Input label="এলাকা" value={address.area || ""} onValueChange={set("area")} />
              <Input label="মোবাইল নম্বর" value={address.phone} onValueChange={set("phone")} isRequired />
              {!session?.user && (
                <Input label="ইমেইল (ঐচ্ছিক)" type="email" value={guestEmail} onValueChange={setGuestEmail} />
              )}
            </div>

            {session?.user && (
              <label className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                এই ঠিকানা সেভ করুন
              </label>
            )}
          </section>

          <section className="rounded-xl border border-neutral-200 p-5">
            <h2 className="font-semibold text-neutral-800 mb-3">পেমেন্ট মেথড</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${
                    paymentMethod === m.value ? "border-brand bg-brand/5" : "border-neutral-200"
                  }`}
                >
                  <input type="radio" name="payment" checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                  {m.label}
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-xl border border-neutral-200 p-5 h-fit">
          <h2 className="font-semibold text-neutral-800 mb-3">অর্ডার সারাংশ</h2>
          <div className="mb-3">
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="কুপন কোড"
                className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm uppercase"
              />
              <button type="button" onClick={applyCoupon} className="rounded-md border border-neutral-300 px-3 text-sm hover:border-brand hover:text-brand">
                প্রয়োগ
              </button>
            </div>
            {couponMsg && <p className={`mt-1 text-xs ${couponMsg.ok ? "text-green-600" : "text-red-500"}`}>{couponMsg.text}</p>}
          </div>
          <ul className="space-y-2 text-sm">
            {cart.items.map((i) => (
              <li key={`${i.productId}-${i.variantId || "b"}`} className="flex justify-between gap-3">
                <span className="text-neutral-600 line-clamp-1">
                  {i.title} × {i.qty}
                </span>
                <span className="text-neutral-800">{formatBDT(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 border-t border-neutral-200" />
          <div className="flex justify-between text-sm text-neutral-600">
            <span>সাবটোটাল</span>
            <span>{formatBDT(cart.subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>কুপন ({coupon.code})</span>
              <span>−{formatBDT(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-neutral-600">
            <span>ডেলিভারি চার্জ</span>
            <span>{address.city ? formatBDT(shippingPreview) : "ঠিকানা দিন"}</span>
          </div>
          <div className="mt-2 flex justify-between font-bold text-neutral-900">
            <span>মোট</span>
            <span>{formatBDT(cart.subtotal - discount + shippingPreview)}</span>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <Button type="submit" color="danger" radius="sm" className="mt-4 w-full" isLoading={submitting}>
            {paymentMethod === "cod" ? "অর্ডার কনফার্ম করুন" : "পেমেন্টে যান"}
          </Button>
        </aside>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { reviewsApi } from "@/lib/tools-client";
import { useSession } from "@/lib/auth-client";

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`text-xl ${n <= value ? "text-amber-500" : "text-neutral-300"} ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => reviewsApi.list(productId).then(setReviews).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const myReview = reviews?.find((r) => r.userId === session?.user?.id);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
  }, [myReview]);

  async function submit(e) {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      await reviewsApi.submit(productId, rating, comment);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!myReview || !window.confirm("আপনার রিভিউ মুছে ফেলবেন?")) return;
    try {
      await reviewsApi.remove(myReview._id);
      setRating(0);
      setComment("");
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="mt-12">
      <h2 className="mb-4 text-lg font-bold text-neutral-900">রিভিউ ও রেটিং</h2>

      {session?.user ? (
        <form onSubmit={submit} className="mb-6 rounded-xl border border-neutral-200 p-4">
          <div className="mb-2 flex items-center gap-3">
            <Stars value={rating} onChange={setRating} />
            {myReview && <span className="text-xs text-neutral-400">(আপনার আগের রিভিউ আপডেট হবে)</span>}
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="প্রোডাক্ট নিয়ে আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex gap-3">
            <button type="submit" disabled={!rating || submitting} className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
              {myReview ? "আপডেট করুন" : "রিভিউ জমা দিন"}
            </button>
            {myReview && (
              <button type="button" onClick={remove} className="text-sm text-red-500 hover:underline">
                মুছে ফেলুন
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-neutral-500">রিভিউ দিতে হলে লগইন করুন।</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!reviews && !error && <p className="text-neutral-400">লোড হচ্ছে...</p>}
      {reviews?.length === 0 && <p className="text-neutral-400">এখনো কোনো রিভিউ নেই — প্রথম রিভিউটি আপনিই দিন।</p>}

      <div className="space-y-4">
        {reviews?.map((r) => (
          <div key={r._id} className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <Stars value={r.rating} />
              <span className="text-sm font-medium text-neutral-800">{r.userName}</span>
              {r.verified && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-700">ভেরিফাইড ক্রয়</span>}
            </div>
            {r.comment && <p className="mt-1 text-sm text-neutral-600">{r.comment}</p>}
            <div className="mt-1 text-xs text-neutral-400">{new Date(r.createdAt).toLocaleDateString("bn-BD")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

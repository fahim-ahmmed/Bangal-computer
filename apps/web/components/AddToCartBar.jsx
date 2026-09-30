"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { wishlistApi } from "@/lib/wishlist-client";

export default function AddToCartBar({ product, inStock }) {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const [adding, setAdding] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    wishlistApi
      .get()
      .then((items) => setInWishlist(items.some((p) => p._id === product._id)))
      .catch(() => {});
  }, [session, product._id]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(product._id);
    } catch (err) {
      alert(err.message || "কার্টে যোগ করা যায়নি");
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!session?.user) {
      alert("উইশলিস্টে যোগ করতে হলে আগে লগইন করুন");
      return;
    }
    setWishBusy(true);
    try {
      if (inWishlist) {
        await wishlistApi.remove(product._id);
        setInWishlist(false);
      } else {
        await wishlistApi.add(product._id);
        setInWishlist(true);
      }
    } catch (err) {
      alert(err.message || "উইশলিস্ট আপডেট করা যায়নি");
    } finally {
      setWishBusy(false);
    }
  }

  return (
    <div className="flex gap-3">
      <Button color="danger" radius="sm" isDisabled={!inStock || adding} isLoading={adding} onClick={handleAddToCart} className="flex-1">
        {inStock ? "কার্টে যোগ করুন" : "স্টকে নেই"}
      </Button>
      <Button variant="bordered" radius="sm" isLoading={wishBusy} onClick={handleWishlist}>
        {inWishlist ? "♥" : "♡"} উইশলিস্ট
      </Button>
    </div>
  );
}

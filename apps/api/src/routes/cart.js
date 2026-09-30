import { Router } from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { attachIdentity, requireAuthOrGuest } from "../lib/auth.js";

const router = Router();

function specsToObject(map) {
  return map instanceof Map ? Object.fromEntries(map) : map || {};
}

async function findOrCreateCart(identity) {
  const query = identity.userId ? { userId: identity.userId } : { guestId: identity.guestId };
  let cart = await Cart.findOne(query);
  if (!cart) cart = new Cart(query);
  return cart;
}

/** Populates cart items with live product data (price/stock/images can drift after adding) */
export async function serializeCart(cart) {
  if (!cart || cart.items.length === 0) return { items: [], subtotal: 0, itemCount: 0 };

  const productIds = cart.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } })
    .populate("brandId", "name")
    .lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = cart.items
    .map((item) => {
      const product = byId.get(String(item.productId));
      if (!product) return null; // product deleted since being added — drop silently

      let unitPrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
      let stock = product.stock;
      let variant = null;
      if (item.variantId) {
        variant = (product.variants || []).find((v) => String(v._id) === String(item.variantId));
        if (variant) {
          unitPrice = variant.price;
          stock = variant.stock;
        }
      }

      return {
        productId: product._id,
        variantId: item.variantId || null,
        title: product.title,
        slug: product.slug,
        brand: product.brandId?.name,
        image: product.images?.[0] || null,
        variantName: variant?.name || null,
        unitPrice,
        qty: item.qty,
        lineTotal: unitPrice * item.qty,
        stock,
        specs: specsToObject(product.specs),
      };
    })
    .filter(Boolean);

  return {
    items,
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
    itemCount: items.reduce((sum, i) => sum + i.qty, 0),
  };
}

// GET /api/cart
router.get("/", attachIdentity(), async (req, res, next) => {
  try {
    if (!req.identity.userId && !req.identity.guestId) {
      return res.json({ success: true, data: { items: [], subtotal: 0, itemCount: 0 } });
    }
    const query = req.identity.userId ? { userId: req.identity.userId } : { guestId: req.identity.guestId };
    const cart = await Cart.findOne(query).lean();
    res.json({ success: true, data: await serializeCart(cart || { items: [] }) });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/items — body: { productId, variantId?, qty? }
router.post("/items", requireAuthOrGuest(), async (req, res, next) => {
  try {
    const { productId, variantId = null, qty = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId আবশ্যক" });

    const product = await Product.findOne({ _id: productId, ...Product.PUBLIC_FILTER });
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

    const cart = await findOrCreateCart(req.identity);
    const existing = cart.items.find(
      (i) => String(i.productId) === String(productId) && String(i.variantId || "") === String(variantId || "")
    );
    if (existing) existing.qty += Number(qty);
    else cart.items.push({ productId, variantId, qty: Number(qty) });

    await cart.save();
    res.status(201).json({ success: true, data: await serializeCart(cart) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/items/:productId — body: { qty, variantId? }
router.put("/items/:productId", requireAuthOrGuest(), async (req, res, next) => {
  try {
    const { qty, variantId = null } = req.body;
    if (!qty || qty < 1) return res.status(400).json({ success: false, message: "qty অন্তত ১ হতে হবে" });

    const cart = await findOrCreateCart(req.identity);
    const item = cart.items.find(
      (i) => String(i.productId) === String(req.params.productId) && String(i.variantId || "") === String(variantId || "")
    );
    if (!item) return res.status(404).json({ success: false, message: "আইটেমটি কার্টে নেই" });

    item.qty = Number(qty);
    await cart.save();
    res.json({ success: true, data: await serializeCart(cart) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/items/:productId — body: { variantId? }
router.delete("/items/:productId", requireAuthOrGuest(), async (req, res, next) => {
  try {
    const { variantId = null } = req.body;
    const cart = await findOrCreateCart(req.identity);
    cart.items = cart.items.filter(
      (i) => !(String(i.productId) === String(req.params.productId) && String(i.variantId || "") === String(variantId || ""))
    );
    await cart.save();
    res.json({ success: true, data: await serializeCart(cart) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart/merge
 * Called right after login. Requires both an active session (cookie) AND
 * the X-Guest-Id header for the cart the person was using while logged out.
 * Guest items are merged into the user's cart (quantities summed), then the
 * guest cart doc is deleted.
 */
router.post("/merge", attachIdentity(), async (req, res, next) => {
  try {
    const guestId = req.headers["x-guest-id"];
    if (!req.identity.userId) {
      return res.status(401).json({ success: false, message: "Login প্রয়োজন" });
    }
    if (!guestId) {
      return res.json({ success: true, data: await serializeCart(await Cart.findOne({ userId: req.identity.userId }).lean()) });
    }

    const guestCart = await Cart.findOne({ guestId });
    const userCart = (await Cart.findOne({ userId: req.identity.userId })) || new Cart({ userId: req.identity.userId });

    if (guestCart) {
      for (const gItem of guestCart.items) {
        const existing = userCart.items.find(
          (i) => String(i.productId) === String(gItem.productId) && String(i.variantId || "") === String(gItem.variantId || "")
        );
        if (existing) existing.qty += gItem.qty;
        else userCart.items.push(gItem);
      }
      await userCart.save();
      await Cart.deleteOne({ _id: guestCart._id });
    }

    res.json({ success: true, data: await serializeCart(userCart) });
  } catch (err) {
    next(err);
  }
});

export default router;

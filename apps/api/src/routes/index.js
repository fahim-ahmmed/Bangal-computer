import { Router } from "express";
import categoriesRouter from "./categories.js";
import brandsRouter from "./brands.js";
import productsRouter from "./products.js";
import cartRouter from "./cart.js";
import wishlistRouter from "./wishlist.js";
import ordersRouter from "./orders.js";
import paymentsRouter from "./payments.js";
import addressesRouter from "./addresses.js";
import accountRouter from "./account.js";
import couponsRouter from "./coupons.js";
import adminRouter from "./admin.js";
import builderRouter from "./builder.js";
import laptopFinderRouter from "./laptop-finder.js";
import reviewsRouter from "./reviews.js";
import settingsRouter from "./settings.js";
import cmsRouter from "./cms.js";
import blogRouter from "./blog.js";
import branchesRouter from "./branches.js";
import contactRouter from "./contact.js";
import chatRouter from "./chat.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, service: "bangal-computer-api", status: "ok" });
});

router.use("/categories", categoriesRouter);
router.use("/brands", brandsRouter);
router.use("/products", productsRouter);
router.use("/cart", cartRouter);
router.use("/wishlist", wishlistRouter);
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);
router.use("/account/addresses", addressesRouter);
router.use("/account", accountRouter);
router.use("/coupons", couponsRouter);
router.use("/admin", adminRouter);
router.use("/builder", builderRouter);
router.use("/laptop-finder", laptopFinderRouter);
router.use("/reviews", reviewsRouter);
router.use("/settings", settingsRouter);
router.use("/cms", cmsRouter);
router.use("/blog", blogRouter);
router.use("/branches", branchesRouter);
router.use("/contact", contactRouter);
router.use("/chat", chatRouter);
// Part 5+: router.use("/cart", cartRouter);
// Part 6+: router.use("/orders", ordersRouter);

export default router;

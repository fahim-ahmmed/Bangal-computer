import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { formatBDT } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import SpecTable from "@/components/SpecTable";
import EmiInfo from "@/components/EmiInfo";
import RelatedProducts from "@/components/RelatedProducts";
import AddToCartBar from "@/components/AddToCartBar";
import ProductReviews from "@/components/ProductReviews";
import { getSiteOrigin } from "@/lib/deployment-config";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "প্রোডাক্ট পাওয়া যায়নি" };

  const price = product.discountPrice || product.price;
  const description = (product.description || `${product.title} — সেরা দামে Bangal Computer-এ।`).slice(0, 155);

  return {
    title: product.title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.title,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
      type: "website",
    },
    other: { "product:price:amount": String(price), "product:price:currency": "BDT" },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(slug);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const inStock = (product.stock ?? 0) > 0 || (product.variants || []).some((v) => v.stock > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images || [],
    description: product.description || product.title,
    sku: product.sku,
    brand: product.brandId?.name ? { "@type": "Brand", name: product.brandId.name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: displayPrice,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${getSiteOrigin()}/product/${product.slug}`,
    },
    ...(product.rating?.count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.avg, reviewCount: product.rating.count } }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-neutral-500 mb-6">
        <Link href="/" className="hover:text-brand">
          হোম
        </Link>{" "}
        /{" "}
        <Link href={`/${product.categoryId?.slug}`} className="hover:text-brand">
          {product.categoryId?.name}
        </Link>{" "}
        /{" "}
        <Link href={`/${product.categoryId?.slug}/${product.subcategoryId?.slug}`} className="hover:text-brand">
          {product.subcategoryId?.name}
        </Link>{" "}
        / <span className="text-neutral-800">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          {product.brandId?.name && (
            <div className="text-sm text-neutral-400 mb-1">{product.brandId.name}</div>
          )}
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">{product.title}</h1>

          {product.rating?.count > 0 && (
            <div className="text-amber-500 text-sm mb-3">
              ★ {product.rating.avg.toFixed(1)} · {product.rating.count}টি রিভিউ
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold text-brand">{formatBDT(displayPrice)}</span>
            {hasDiscount && (
              <span className="text-neutral-400 line-through">{formatBDT(product.price)}</span>
            )}
          </div>

          <div className={`text-sm font-medium mb-4 ${inStock ? "text-green-600" : "text-red-500"}`}>
            {inStock ? "স্টকে আছে" : "স্টকে নেই"}
          </div>

          <EmiInfo price={displayPrice} />

          {product.description && (
            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6">
            <AddToCartBar product={product} inStock={inStock} />
          </div>
        </div>
      </div>

      {Object.keys(product.specs || {}).length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">স্পেসিফিকেশন</h2>
          <SpecTable specs={product.specs} />
        </div>
      )}

      <ProductReviews productId={product._id} />

      <RelatedProducts products={related} />
    </div>
  );
}

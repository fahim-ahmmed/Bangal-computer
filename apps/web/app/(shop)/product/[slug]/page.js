import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { formatBDT } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import SpecTable from "@/components/SpecTable";
import RelatedProducts from "@/components/RelatedProducts";
import AddToCartBar from "@/components/AddToCartBar";
import ProductReviews from "@/components/ProductReviews";
import { getSiteOrigin } from "@/lib/deployment-config";
import {
  ShieldCheckIcon,
  TruckIcon,
  BanknotesIcon,
  TagIcon
} from "@heroicons/react/24/outline";

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
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const sku = product.sku || product._id?.toString().slice(-6).toUpperCase() || "N/A";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images || [],
    description: product.description || product.title,
    sku: sku,
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
    <div className="bg-[#f8f9fa] min-h-screen pb-16 pt-4">
      {/* JSON-LD for SEO */}
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* প্রফেশনাল ব্রেডক্রাম্ব */}
        <nav className="flex items-center text-xs sm:text-sm text-gray-500 mb-6 bg-white px-5 py-3.5 rounded-xl shadow-sm border border-gray-100 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-red-600 transition font-medium">হোম</Link>
          <span className="mx-2.5 text-gray-300">/</span>
          {product.categoryId?.name && (
            <>
              <Link href={`/${product.categoryId?.slug}`} className="hover:text-red-600 transition">{product.categoryId.name}</Link>
              <span className="mx-2.5 text-gray-300">/</span>
            </>
          )}
          {product.subcategoryId?.name && (
            <>
              <Link href={`/${product.categoryId?.slug}/${product.subcategoryId?.slug}`} className="hover:text-red-600 transition">
                {product.subcategoryId.name}
              </Link>
              <span className="mx-2.5 text-gray-300">/</span>
            </>
          )}
          <span className="text-gray-800 font-bold truncate">{product.title}</span>
        </nav>

        {/* মূল প্রোডাক্ট সেকশন */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-10 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

            {/* বাম পাশ: গ্যালারি */}
            <div className="lg:col-span-5 relative">
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider">
                  <TagIcon className="w-4 h-4" />
                  {discountPercent}% ছাড়
                </div>
              )}
              <ProductGallery images={product.images} title={product.title} />
            </div>

            {/* ডান পাশ: ইনফরমেশন */}
            <div className="lg:col-span-7 flex flex-col justify-center">

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {product.brandId?.name && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-extrabold px-3 py-1.5 rounded-md uppercase tracking-wide w-max">
                    {product.brandId.name}
                  </div>
                )}
                {product.rating?.count > 0 && (
                  <div className="flex items-center gap-1.5 text-sm bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">
                    <span className="text-amber-500 font-bold">★ {product.rating.avg.toFixed(1)}</span>
                    <span className="text-amber-700/60 font-medium">({product.rating.count} রিভিউ)</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-snug mb-6">
                {product.title}
              </h1>

              {/* ইনফো পিলস */}
              <div className="flex flex-wrap gap-2.5 mb-6">
                <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-sm">
                  <span className="text-gray-500">স্ট্যাটাস: </span>
                  <span className={`font-bold flex items-center gap-1.5 inline-flex ${inStock ? "text-emerald-600" : "text-red-500"}`}>
                    <span className={`w-2 h-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-500"}`}></span>
                    {inStock ? "স্টকে আছে" : "স্টকে নেই"}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-sm">
                  <span className="text-gray-500">প্রোডাক্ট কোড: </span>
                  <span className="font-bold text-gray-900">{sku}</span>
                </div>
              </div>

              {/* প্রাইস হাইলাইট */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">অফিসিয়াল মূল্য</p>
                    <span className="text-4xl font-black text-red-600 tracking-tight">
                      {formatBDT(displayPrice)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="pb-1">
                      <span className="text-lg text-gray-400 line-through decoration-gray-300 font-medium mr-3">
                        {formatBDT(product.price)}
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-md inline-block">
                        সাশ্রয় {formatBDT(product.price - displayPrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* সংক্ষিপ্ত বৈশিষ্ট্য */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">মূল বৈশিষ্ট্যসমূহ</h3>
                <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">▪</span> আধুনিক বিল্ড কোয়ালিটি ও প্রিমিয়াম পারফরম্যান্স
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">▪</span> শতভাগ অরিজিনাল এবং ব্র্যান্ড নিউ
                  </li>
                </ul>
              </div>

              {/* EMI সেকশন */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-2 text-red-800 font-bold text-sm mb-3">
                  <BanknotesIcon className="w-5 h-5" />
                  <span>EMI সুবিধা (ক্রেডিট কার্ডের মাধ্যমে)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-700">
                  <div className="bg-white py-2 rounded-lg shadow-sm border border-orange-100/50">
                    <span className="block text-gray-500 mb-0.5">৩ মাস</span>
                    <b className="text-sm">৳{Math.ceil(displayPrice / 3)}</b>/মাস
                  </div>
                  <div className="bg-white py-2 rounded-lg shadow-sm border border-orange-100/50">
                    <span className="block text-gray-500 mb-0.5">৬ মাস</span>
                    <b className="text-sm">৳{Math.ceil(displayPrice / 6)}</b>/মাস
                  </div>
                  <div className="bg-white py-2 rounded-lg shadow-sm border border-orange-100/50">
                    <span className="block text-gray-500 mb-0.5">১২ মাস</span>
                    <b className="text-sm">৳{Math.ceil(displayPrice / 12)}</b>/মাস
                  </div>
                </div>
              </div>

              {/* অ্যাকশন বাটনস */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <AddToCartBar product={product} inStock={inStock} />
              </div>

            </div>
          </div>
        </div>

        {/* Sticky Page Navigation */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border border-gray-200 hidden md:flex items-center gap-10 px-8 py-4 mb-8 rounded-2xl transition-all">
          <a href="#description" className="text-sm font-extrabold text-gray-600 hover:text-red-600 transition">বিস্তারিত বিবরণ</a>
          {Object.keys(product.specs || {}).length > 0 && (
            <a href="#specification" className="text-sm font-extrabold text-gray-600 hover:text-red-600 transition">স্পেসিফিকেশন</a>
          )}
          <a href="#reviews" className="text-sm font-extrabold text-gray-600 hover:text-red-600 transition">কাস্টমার রিভিউ</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-8">

            {/* বিবরণ সেকশন */}
            <div id="description" className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-24">
              <div className="bg-gray-50 border-b border-gray-200 px-6 sm:px-8 py-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                  বিস্তারিত বিবরণ
                </h2>
              </div>
              <div className="p-6 sm:px-8 sm:py-8 text-gray-600 text-sm sm:text-base leading-relaxed">
                {product.description ? (
                  <div className="prose max-w-none prose-red">
                    {product.description}
                  </div>
                ) : (
                  <p>এই পণ্যটির বিস্তারিত বিবরণ খুব শীঘ্রই যুক্ত করা হবে। যেকোনো তথ্যের জন্য আমাদের হটলাইনে যোগাযোগ করুন।</p>
                )}
              </div>
            </div>

            {/* স্পেসিফিকেশন সেকশন */}
            {Object.keys(product.specs || {}).length > 0 && (
              <div id="specification" className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-24">
                <div className="bg-gray-50 border-b border-gray-200 px-6 sm:px-8 py-5">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                    স্পেসিফিকেশন
                  </h2>
                </div>
                <div className="p-6 sm:px-8 sm:py-8">
                  <SpecTable specs={product.specs} />
                </div>
              </div>
            )}

            {/* রিভিউ সেকশন */}
            <div id="reviews" className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-24">
              <div className="bg-gray-50 border-b border-gray-200 px-6 sm:px-8 py-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                  কাস্টমার রিভিউ
                </h2>
              </div>
              <div className="p-6 sm:px-8 sm:py-8">
                <ProductReviews productId={product._id} />
              </div>
            </div>
          </div>

          {/* ডান পাশ: সার্ভিস ও গ্যারান্টি (Sticky Sidebar) */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">অফিসিয়াল ওয়ারেন্টি</h4>
                  <p className="text-xs text-gray-500 leading-snug">ব্র্যান্ডের শর্তাবলি অনুযায়ী ১০০% অরিজিনাল পণ্যের ওয়ারেন্টি নিশ্চিত করা হয়।</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                  <TruckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">সারা দেশে ডেলিভারি</h4>
                  <p className="text-xs text-gray-500 leading-snug">ঢাকা সহ সারা বাংলাদেশে কুরিয়ারের মাধ্যমে দ্রুত পণ্য পৌঁছে দেওয়া হয়।</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* রিলেটেড প্রোডাক্টস */}
        {related?.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1.5 h-7 bg-red-600 rounded-full"></span>
              সম্পর্কিত পণ্যসমূহ
            </h2>
            <RelatedProducts products={related} />
          </div>
        )}

      </div>
    </div>
  );
}
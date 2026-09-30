import Link from "next/link";
import { getCategoryTree } from "@/lib/categories";
import { cmsApi } from "@/lib/content-client";
import { getProducts } from "@/lib/products";
import BannerSlider from "@/components/BannerSlider";
import HappyHourBanner from "@/components/HappyHourBanner";
import ProductGrid from "@/components/ProductGrid";

export default async function HomePage() {
  const [tree, banners, happyHour, featured, latest] = await Promise.all([
    getCategoryTree(),
    cmsApi.banners().catch(() => []),
    cmsApi.happyHour().catch(() => ({ active: false })),
    getProducts({ featured: "true", limit: 8 }).catch(() => ({ items: [] })),
    getProducts({ sort: "newest", limit: 8 }).catch(() => ({ items: [] })),
  ]);
  const products = featured.items?.length ? featured.items : latest.items || [];
  const heroProduct = products[0];

  return (
    <div className="bg-[#f5f6f7] pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:pt-7">
        <section className="grid overflow-hidden rounded-md bg-white shadow-sm lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              আপনার প্রযুক্তির নির্ভরযোগ্য ঠিকানা
            </p>
            <h1 className="max-w-xl text-3xl font-bold leading-tight text-neutral-950 sm:text-4xl">
              Bangal Computer
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-600 sm:text-base">
              কম্পিউটার, ল্যাপটপ, কম্পোনেন্ট ও দৈনন্দিন টেকের পছন্দের সংগ্রহ এক জায়গায়।
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#categories"
                className="inline-flex items-center rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                ক্যাটাগরি দেখুন
              </Link>
              <Link
                href="/pc-builder"
                className="inline-flex items-center rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-800 transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                PC Builder <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {banners.length > 0 ? (
            <BannerSlider banners={banners} />
          ) : (
            <Link
              href={heroProduct ? `/product/${heroProduct.slug}` : "/laptop"}
              className="group relative block min-h-64 overflow-hidden bg-neutral-200 sm:min-h-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroProduct?.images?.[0] || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=85"}
                alt={heroProduct?.title || "Laptop and workspace"}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/65 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  {heroProduct ? "এখনই দেখুন" : "প্রয়োজনের টেক, এক জায়গায়"}
                </span>
                <p className="mt-1 max-w-lg text-lg font-semibold sm:text-xl">
                  {heroProduct?.title || "আপনার পরের প্রযুক্তি পছন্দটি খুঁজে নিন"}
                </p>
              </div>
            </Link>
          )}
        </section>

        <HappyHourBanner happyHour={happyHour} />

        <nav aria-label="দ্রুত লিংক" className="mt-5 grid grid-cols-2 overflow-hidden rounded-md border border-neutral-200 bg-white sm:grid-cols-4">
          {[
            ["PC Builder", "/pc-builder", "নিজের পিসি সাজান"],
            ["Laptop Finder", "/laptop-finder", "ব্যবহার অনুযায়ী খুঁজুন"],
            ["AC ক্যালকুলেটর", "/ac-calculator", "রুমের জন্য সঠিক AC"],
            ["স্টোর লোকেটর", "/store-locator", "কাছের ব্রাঞ্চ খুঁজুন"],
          ].map(([title, href, detail]) => (
            <Link
              key={href}
              href={href}
              className="group border-b border-r border-neutral-200 px-4 py-4 transition-colors duration-200 hover:bg-red-50 sm:border-b-0"
            >
              <span className="block text-sm font-semibold text-neutral-900 transition-colors group-hover:text-brand">{title}</span>
              <span className="mt-1 block text-xs text-neutral-500">{detail}</span>
            </Link>
          ))}
        </nav>

        <section id="categories" className="scroll-mt-40 pt-10 sm:pt-12">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">শপ বাই ডিপার্টমেন্ট</p>
              <h2 className="mt-1 text-xl font-bold text-neutral-950 sm:text-2xl">ক্যাটাগরি ধরে খুঁজুন</h2>
            </div>
            <span className="hidden text-sm text-neutral-500 sm:block">{tree.length}টি বিভাগ</span>
          </div>

          {tree.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
              {tree.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/${cat.slug}`}
                  className="group flex min-h-24 items-start justify-between rounded-md border border-neutral-200 bg-white p-3.5 transition duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:min-h-28 sm:p-4"
                >
                  <span>
                    <span className="block text-sm font-semibold leading-5 text-neutral-900 transition-colors group-hover:text-brand">{cat.name}</span>
                    <span className="mt-2 block text-xs text-neutral-500">{cat.subcategories?.length || 0}টি সাবক্যাটাগরি</span>
                  </span>
                  <span className="ml-2 text-lg text-neutral-300 transition duration-200 group-hover:translate-x-1 group-hover:text-brand" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-neutral-200 bg-white p-5 text-sm text-neutral-500">
              কোনো ক্যাটাগরি পাওয়া যায়নি। ক্যাটাগরি seed করে আবার চেষ্টা করুন।
            </p>
          )}
        </section>

        {products.length > 0 && (
          <section className="pt-10 sm:pt-12">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                  {featured.items?.length ? "আপনার জন্য বাছাই করা" : "নতুন সংযোজন"}
                </p>
                <h2 className="mt-1 text-xl font-bold text-neutral-950 sm:text-2xl">
                  {featured.items?.length ? "ফিচার্ড প্রোডাক্ট" : "সাম্প্রতিক প্রোডাক্ট"}
                </h2>
              </div>
              <Link href="/search" className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark">
                সব প্রোডাক্ট <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ProductGrid products={products} />
          </section>
        )}
      </div>
    </div>
  );
}

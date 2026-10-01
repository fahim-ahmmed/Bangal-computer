import Link from "next/link";
import Image from "next/image";
import { getCategoryTree } from "@/lib/categories";
import { blogApi, cmsApi } from "@/lib/content-client";
import { formatBDT } from "@/lib/format";
import { getProducts } from "@/lib/products";
import BannerSlider from "@/components/BannerSlider";
import HappyHourBanner from "@/components/HappyHourBanner";
import ProductGrid from "@/components/ProductGrid";
import TechnologyImageSlider from "@/components/TechnologyImageSlider";

const shoppingTools = [
  {
    eyebrow: "নিজের মতো কনফিগার",
    title: "PC Builder",
    description: "কম্পোনেন্ট বেছে তৈরি করুন আপনার পছন্দের পিসি।",
    href: "/pc-builder",
    icon: "🖥️",
    accent: "from-red-50 to-white",
  },
  {
    eyebrow: "সহজে ল্যাপটপ খুঁজুন",
    title: "Laptop Finder",
    description: "কাজ, পড়াশোনা বা গেমিং—প্রয়োজন অনুযায়ী বেছে নিন।",
    href: "/laptop-finder",
    icon: "💻",
    accent: "from-blue-50 to-white",
  },
  {
    eyebrow: "সঠিক কুলিং প্ল্যান",
    title: "AC ক্যালকুলেটর",
    description: "রুমের মাপ অনুযায়ী প্রয়োজনীয় AC ক্যাপাসিটি জানুন।",
    href: "/ac-calculator",
    icon: "❄️",
    accent: "from-cyan-50 to-white",
  },
];

function categoryIcon(name = "") {
  const value = name.toLowerCase();
  if (value.includes("laptop")) return "💻";
  if (value.includes("desktop") || value.includes("pc")) return "🖥️";
  if (value.includes("monitor") || value.includes("display")) return "🖥️";
  if (value.includes("gaming")) return "🎮";
  if (value.includes("printer")) return "🖨️";
  if (value.includes("network")) return "📡";
  if (value.includes("accessor")) return "⌨️";
  if (value.includes("component")) return "⚙️";
  if (value.includes("camera")) return "📷";
  if (value.includes("audio") || value.includes("headphone")) return "🎧";
  return "✨";
}

function SectionHeading({ eyebrow, title, href, linkLabel = "সব দেখুন" }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold text-neutral-950 sm:text-2xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [tree, banners, happyHour, featured, latest, blogResult] = await Promise.all([
    getCategoryTree(),
    cmsApi.banners().catch(() => []),
    cmsApi.happyHour().catch(() => ({ active: false })),
    getProducts({ featured: "true", limit: 8 }).catch(() => ({ items: [] })),
    getProducts({ sort: "newest", limit: 8 }).catch(() => ({ items: [] })),
    blogApi.list(1).catch(() => ({ data: [] })),
  ]);
  const featuredProducts = featured.items || [];
  const latestProducts = latest.items || [];
  const heroProduct = featuredProducts[0] || latestProducts[0];
  const posts = (blogResult.data || []).slice(0, 3);

  return (
    <div className="overflow-hidden bg-[#f5f6f7] pb-14">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:pt-8">
        <section className="relative isolate overflow-hidden rounded-2xl bg-neutral-950 shadow-xl shadow-neutral-900/10 sm:rounded-3xl">
          <div className="pointer-events-none absolute -right-24 -top-40 -z-10 h-96 w-96 rounded-full bg-brand/30 blur-3xl" />
          <div className="grid lg:min-h-[440px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                প্রযুক্তির পছন্দ, এখন এক জায়গায়
              </span>
              <h1 className="max-w-xl text-3xl font-extrabold !leading-[1.4] tracking-tight text-white sm:text-4xl lg:text-[3rem] xl:text-[3.25rem]">
                <span className="block">আপনার পরের</span>
                <span className="block text-red-400">টেক আপগ্রেড</span>
                <span className="block">শুরু হোক এখানেই</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-neutral-300 sm:text-base sm:leading-8">
                ল্যাপটপ, কম্পিউটার, কম্পোনেন্ট ও প্রয়োজনীয় টেক অ্যাক্সেসরিজ—খুঁজে নিন আপনার কাজ ও বাজেটের জন্য।
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  প্রোডাক্ট খুঁজুন <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/pc-builder"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span aria-hidden="true">🖥️</span> PC Builder
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-neutral-300">
                <span>✓ পছন্দমতো ক্যাটাগরি</span>
                <span>✓ সহজ প্রোডাক্ট তুলনা</span>
                <span>✓ অনলাইন ও স্টোর—দুই অভিজ্ঞতা</span>
              </div>
            </div>

            <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:min-h-full">
              {banners.length > 0 ? (
                <BannerSlider banners={banners} />
              ) : heroProduct?.images?.[0] ? (
                <Link
                  href={`/product/${heroProduct.slug}`}
                  className="group absolute inset-0 block bg-neutral-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroProduct.images[0]}
                    alt={heroProduct.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/10 to-neutral-950/10" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      এই মুহূর্তের পছন্দ
                    </span>
                    <p className="mt-3 max-w-lg text-lg font-bold leading-snug text-white sm:text-2xl">
                      {heroProduct.title}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      {formatBDT(heroProduct.discountPrice || heroProduct.price)}
                      <span aria-hidden="true">↗</span>
                    </span>
                  </div>
                </Link>
              ) : (
                <TechnologyImageSlider />
              )}
            </div>
          </div>
        </section>

        <HappyHourBanner happyHour={happyHour} />

        <section
          aria-label="কেনাকাটার সুবিধা"
          className="mt-5 grid overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm sm:grid-cols-3"
        >
          {[
            ["⌕", "সহজে খুঁজে নিন", "সার্চ ও ক্যাটাগরি দিয়ে পছন্দের পণ্য"],
            ["⇄", "তুলনা করে বাছুন", "একাধিক প্রোডাক্টের ফিচার মিলিয়ে দেখুন"],
            ["⌖", "স্টোর খুঁজে নিন", "আপনার কাছের ব্রাঞ্চের তথ্য দেখুন"],
          ].map(([icon, title, description], index) => (
            <div
              key={title}
              className={`flex items-center gap-3.5 px-5 py-4 sm:px-6 ${index < 2 ? "border-b border-neutral-100 sm:border-b-0 sm:border-r" : ""}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl font-bold text-brand">
                {icon}
              </span>
              <span>
                <span className="block text-sm font-bold text-neutral-900">{title}</span>
                <span className="mt-0.5 block text-xs leading-5 text-neutral-500">{description}</span>
              </span>
            </div>
          ))}
        </section>

        <section id="categories" className="scroll-mt-40 pt-10 sm:pt-14">
          <SectionHeading
            eyebrow="শপ বাই ডিপার্টমেন্ট"
            title="আপনার প্রয়োজনের বিভাগ"
            href="/search"
            linkLabel="সব ক্যাটাগরি"
          />
          {tree.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {tree.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/${cat.slug}`}
                  className="group flex min-h-28 items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-neutral-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:gap-4 sm:p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-50 text-2xl transition-colors group-hover:bg-red-50">
                    {categoryIcon(cat.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-neutral-900 transition-colors group-hover:text-brand sm:text-base">
                      {cat.name}
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      {cat.subcategories?.length || 0}টি সাবক্যাটাগরি
                    </span>
                  </span>
                  <span className="text-lg text-neutral-300 transition group-hover:translate-x-1 group-hover:text-brand" aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500">
              কোনো ক্যাটাগরি পাওয়া যায়নি। ক্যাটাগরি seed করে আবার চেষ্টা করুন।
            </p>
          )}
        </section>

        <section className="pt-10 sm:pt-14">
          <SectionHeading eyebrow="কাজকে করুন আরও সহজ" title="স্মার্ট কেনাকাটার টুলস" />
          <div className="grid gap-3 sm:grid-cols-3">
            {shoppingTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br ${tool.accent} p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6`}
              >
                <span className="absolute -right-3 -top-5 text-7xl opacity-[0.12] transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                  {tool.icon}
                </span>
                <span className="relative text-xs font-bold uppercase tracking-wider text-brand">{tool.eyebrow}</span>
                <span className="relative mt-2 block text-xl font-extrabold text-neutral-950">{tool.title}</span>
                <span className="relative mt-2 block max-w-xs text-sm leading-6 text-neutral-600">{tool.description}</span>
                <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-bold text-neutral-900 transition-colors group-hover:text-brand">
                  শুরু করুন <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section className="pt-10 sm:pt-14">
            <SectionHeading
              eyebrow="আপনার জন্য বাছাই করা"
              title="ফিচার্ড প্রোডাক্ট"
              href="/search?sort=featured"
            />
            <ProductGrid products={featuredProducts} />
          </section>
        )}

        {latestProducts.length > 0 && (
          <section className="pt-10 sm:pt-14">
            <SectionHeading
              eyebrow="সদ্য যোগ হয়েছে"
              title="নতুন প্রোডাক্ট"
              href="/search?sort=newest"
            />
            <ProductGrid products={latestProducts} />
          </section>
        )}

        <section className="pt-10 sm:pt-14">
          <div className="relative isolate flex min-h-[300px] flex-col justify-center overflow-hidden rounded-3xl bg-neutral-950 px-6 py-8 text-white shadow-xl shadow-neutral-900/10 sm:px-10 sm:py-10 lg:min-h-[320px] lg:px-14">
            <Image
              src="/images/pic2.jpg"
              alt="Bangal Computer স্টোরে কম্পিউটার ও প্রযুক্তি পণ্য"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="absolute inset-0 -z-20 object-cover object-center"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/35" />
            <div className="absolute inset-0 -z-10 bg-neutral-950/20" />
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-white/90 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                কেনার আগে পরিকল্পনা করুন
              </p>
              <h2 className="mt-4 text-2xl font-extrabold leading-snug sm:text-3xl lg:text-4xl">
                আপনার সেটআপ,
                <span className="text-red-300"> আপনার সিদ্ধান্ত</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                পিসির যন্ত্রাংশ মিলিয়ে নিন, তুলনা করে দেখুন, অথবা ব্যবহার অনুযায়ী ল্যাপটপ খুঁজে নিন।
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/pc-builder"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                PC Builder <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/laptop-finder"
                className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Laptop Finder <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {posts.length > 0 && (
          <section className="pt-10 sm:pt-14">
            <SectionHeading eyebrow="জানুন, শিখুন, আপডেট থাকুন" title="ব্লগ ও টেক নিউজ" href="/blog" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-100 to-red-50 text-4xl" aria-hidden="true">
                        📰
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 font-bold leading-6 text-neutral-900 transition-colors group-hover:text-brand">
                      {post.title}
                    </h3>
                    {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">{post.excerpt}</p>}
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand">
                      বিস্তারিত পড়ুন <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

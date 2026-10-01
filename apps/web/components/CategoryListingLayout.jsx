import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/products";
import ProductFilters from "./ProductFilters";
import SortBar from "./SortBar";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";

/**
 * @param {{href:string, label:string}[]} breadcrumb
 * @param {object} baseFilter  category/subcategory/brand slugs to lock in
 * @param {string} basePath    current URL path (for filter/sort/pagination links)
 * @param {object} searchParams  raw Next.js searchParams for this request
 * @param {React.ReactNode} [extraTop]  e.g. subcategory grid shown above the listing
 */
export default async function CategoryListingLayout({
  breadcrumb,
  baseFilter,
  basePath,
  searchParams,
  extraTop,
}) {
  const sp = await searchParams;
  const { items, pagination, facets } = await getProducts({ ...baseFilter, ...sp });
  const currentLabel = breadcrumb[breadcrumb.length - 1].label;
  const title = String(currentLabel || "প্রোডাক্ট");
  const categoryPath = `${breadcrumb.map((item) => item.label).join(" ")} ${basePath}`.toLowerCase();
  const categoryImage = /camera|ক্যামেরা/.test(categoryPath)
    ? "/images/category-camera.jpg"
    : /monitor|display|মনিটর|ডিসপ্লে/.test(categoryPath)
      ? "/images/category-monitor.jpg"
      : /component|processor|motherboard|graphics card|কম্পোনেন্ট|প্রসেসর|মাদারবোর্ড/.test(categoryPath)
        ? "/images/category-components.jpg"
        : /laptop|notebook|ল্যাপটপ/.test(categoryPath)
          ? "/images/category-laptop.jpg"
          : /desktop|ডেস্কটপ/.test(categoryPath)
            ? "/images/category-desktop-pc.jpg"
            : /accessor|keyboard|mouse|অ্যাক্সেসরিজ|কিবোর্ড|মাউস/.test(categoryPath)
              ? "/images/category-accessories.jpg"
              : "/images/category-tech.jpg";

  return (
    <div className="min-h-[60vh] bg-[#f5f6f7]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
        <nav aria-label="ব্রেডক্রাম্ব" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500 sm:text-sm">
          {breadcrumb.map((b, i) => (
            <span key={b.href} className="inline-flex items-center gap-2">
              {i > 0 && <span className="text-neutral-300" aria-hidden="true">/</span>}
              {i === breadcrumb.length - 1 ? (
                <span aria-current="page" className="font-semibold text-neutral-800">{b.label}</span>
              ) : (
                <Link href={b.href} className="transition-colors hover:text-brand">
                  {b.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <section className="relative isolate mb-6 min-h-[260px] overflow-hidden rounded-3xl bg-neutral-950 shadow-lg shadow-neutral-900/10 sm:mb-8 sm:min-h-[290px]">
          <Image
            src={categoryImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 1280px"
            className="absolute inset-0 -z-20 object-cover object-center"
            priority
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/25" />
          <div className="absolute inset-0 -z-10 bg-neutral-950/15" />
          <div className="flex min-h-[260px] items-center px-5 py-7 sm:min-h-[290px] sm:px-9 sm:py-9 lg:px-12">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Bangal Computer · {breadcrumb.length > 2 ? "পণ্য খুঁজুন" : "টেক কালেকশন"}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                {title}-এর পছন্দের পণ্যগুলো দেখুন, ফিল্টার করে আপনার প্রয়োজন ও বাজেটের সঙ্গে মিলিয়ে নিন।
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-white">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  {pagination?.total ?? 0}টি প্রোডাক্ট
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  সহজ ফিল্টার ও তুলনা
                </span>
              </div>
            </div>
          </div>
        </section>

        {extraTop}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
          <ProductFilters basePath={basePath} facets={facets} />
          <section aria-label={`${title} প্রোডাক্ট`} className="min-w-0 flex-1">
            <SortBar basePath={basePath} total={pagination?.total} />
            <ProductGrid products={items} />
            <Pagination basePath={basePath} searchParams={sp} pagination={pagination} />
          </section>
        </div>
      </div>
    </div>
  );
}

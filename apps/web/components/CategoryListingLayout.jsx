import Link from "next/link";
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-sm text-neutral-500 mb-4 flex flex-wrap gap-1">
        {breadcrumb.map((b, i) => (
          <span key={b.href}>
            {i > 0 && " / "}
            {i === breadcrumb.length - 1 ? (
              <span className="text-neutral-800">{b.label}</span>
            ) : (
              <Link href={b.href} className="hover:text-brand">
                {b.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        {breadcrumb[breadcrumb.length - 1].label}
      </h1>

      {extraTop}

      <div className="flex flex-col md:flex-row gap-8">
        <ProductFilters basePath={basePath} facets={facets} />
        <div className="flex-1">
          <SortBar basePath={basePath} total={pagination?.total} />
          <ProductGrid products={items} />
          <Pagination basePath={basePath} searchParams={sp} pagination={pagination} />
        </div>
      </div>
    </div>
  );
}

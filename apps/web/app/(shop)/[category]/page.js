import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveCategoryPath } from "@/lib/categories";
import CategoryListingLayout from "@/components/CategoryListingLayout";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const result = await resolveCategoryPath([category]);
  if (!result?.success) return {};
  const { main } = result.data;
  return {
    title: main.name,
    description: `Bangal Computer-এ ${main.name} ক্যাটাগরির সব প্রোডাক্ট — সেরা দামে, দ্রুত ডেলিভারি।`,
    alternates: { canonical: `/${main.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const result = await resolveCategoryPath([category]);
  if (!result?.success) notFound();

  const { main, subcategories } = result.data;

  const extraTop = subcategories?.length > 0 && (
    <section aria-label={`${main.name} সাবক্যাটাগরি`} className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 sm:text-base">বিভাগ ব্রাউজ করুন</h2>
          <p className="mt-1 text-xs text-neutral-500">আপনার প্রয়োজনের সাবক্যাটাগরি বেছে নিন</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500">
          {subcategories.length}টি বিভাগ
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {subcategories.map((sub) => (
          <Link
            key={sub._id}
            href={`/${main.slug}/${sub.slug}`}
            className="group flex min-h-11 items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-neutral-50/70 px-3 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-brand sm:text-sm"
          >
            <span className="line-clamp-2">{sub.name}</span>
            <span aria-hidden="true" className="shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand">→</span>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <CategoryListingLayout
      breadcrumb={[
        { href: "/", label: "হোম" },
        { href: `/${main.slug}`, label: main.name },
      ]}
      baseFilter={{ category: main.slug }}
      basePath={`/${main.slug}`}
      searchParams={searchParams}
      extraTop={extraTop}
    />
  );
}

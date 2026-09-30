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
    <div className="mb-8 flex flex-wrap gap-2">
      {subcategories.map((sub) => (
        <Link
          key={sub._id}
          href={`/${main.slug}/${sub.slug}`}
          className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-700 hover:border-brand hover:text-brand"
        >
          {sub.name}
        </Link>
      ))}
    </div>
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

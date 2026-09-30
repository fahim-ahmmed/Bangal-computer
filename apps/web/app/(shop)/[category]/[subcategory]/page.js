import { notFound } from "next/navigation";
import { resolveCategoryPath } from "@/lib/categories";
import CategoryListingLayout from "@/components/CategoryListingLayout";

export async function generateMetadata({ params }) {
  const { category, subcategory } = await params;
  const result = await resolveCategoryPath([category, subcategory]);
  if (!result?.success) return {};
  const { main, sub } = result.data;
  return {
    title: `${sub.name} — ${main.name}`,
    description: `Bangal Computer-এ ${main.name} বিভাগের ${sub.name} — সেরা দামে, দ্রুত ডেলিভারি।`,
    alternates: { canonical: `/${main.slug}/${sub.slug}` },
  };
}

export default async function SubcategoryPage({ params, searchParams }) {
  const { category, subcategory } = await params;
  const result = await resolveCategoryPath([category, subcategory]);
  if (!result?.success) notFound();

  const { main, sub } = result.data;

  return (
    <CategoryListingLayout
      breadcrumb={[
        { href: "/", label: "হোম" },
        { href: `/${main.slug}`, label: main.name },
        { href: `/${main.slug}/${sub.slug}`, label: sub.name },
      ]}
      baseFilter={{ category: main.slug, subcategory: sub.slug }}
      basePath={`/${main.slug}/${sub.slug}`}
      searchParams={searchParams}
    />
  );
}

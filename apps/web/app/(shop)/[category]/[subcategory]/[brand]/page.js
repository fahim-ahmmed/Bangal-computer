import { notFound } from "next/navigation";
import { resolveCategoryPath } from "@/lib/categories";
import CategoryListingLayout from "@/components/CategoryListingLayout";

export async function generateMetadata({ params }) {
  const { category, subcategory, brand } = await params;
  const result = await resolveCategoryPath([category, subcategory, brand]);
  if (!result?.success) return {};
  const { main, sub, brand: brandDoc } = result.data;
  return {
    title: `${brandDoc.name} ${sub.name}`,
    description: `${brandDoc.name}-এর সব ${sub.name} — Bangal Computer-এ সেরা দামে।`,
    alternates: { canonical: `/${main.slug}/${sub.slug}/${brandDoc.slug}` },
  };
}

export default async function BrandPage({ params, searchParams }) {
  const { category, subcategory, brand } = await params;
  const result = await resolveCategoryPath([category, subcategory, brand]);
  if (!result?.success) notFound();

  const { main, sub, brand: brandDoc } = result.data;

  return (
    <CategoryListingLayout
      breadcrumb={[
        { href: "/", label: "হোম" },
        { href: `/${main.slug}`, label: main.name },
        { href: `/${main.slug}/${sub.slug}`, label: sub.name },
        { href: `/${main.slug}/${sub.slug}/${brandDoc.slug}`, label: brandDoc.name },
      ]}
      baseFilter={{ category: main.slug, subcategory: sub.slug, brand: brandDoc.slug }}
      basePath={`/${main.slug}/${sub.slug}/${brandDoc.slug}`}
      searchParams={searchParams}
    />
  );
}

import CategoryListingLayout from "@/components/CategoryListingLayout";

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = sp.q || "";

  return (
    <CategoryListingLayout
      breadcrumb={[
        { href: "/", label: "হোম" },
        { href: "/search", label: q ? `"${q}" এর সার্চ ফলাফল` : "সার্চ" },
      ]}
      baseFilter={{}}
      basePath="/search"
      searchParams={searchParams}
    />
  );
}

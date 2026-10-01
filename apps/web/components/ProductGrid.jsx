import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-5 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 7.8 8.5 4.4 8.5-4.4M12 12.2V21" />
          </svg>
        </span>
        <h2 className="mt-4 text-base font-bold text-neutral-800">এখনো কোনো প্রোডাক্ট পাওয়া যায়নি</h2>
        <p className="mt-1 max-w-sm text-sm leading-6 text-neutral-500">
          এই বিভাগে নতুন পণ্য যোগ হলে এখানে দেখা যাবে। অন্য বিভাগ ঘুরে দেখতে পারেন।
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

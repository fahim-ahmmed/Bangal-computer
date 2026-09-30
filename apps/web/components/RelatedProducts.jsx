import ProductCard from "./ProductCard";

export default function RelatedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-14">
      <h2 className="text-lg font-bold text-neutral-900 mb-4">সম্পর্কিত প্রোডাক্ট</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}

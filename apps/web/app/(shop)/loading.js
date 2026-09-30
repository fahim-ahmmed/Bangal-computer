export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-pulse">
      <div className="mb-6 h-6 w-40 rounded bg-neutral-200" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-neutral-100" />
        ))}
      </div>
    </div>
  );
}

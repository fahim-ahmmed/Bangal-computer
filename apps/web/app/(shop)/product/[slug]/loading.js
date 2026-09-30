export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-pulse">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square rounded-xl bg-neutral-100" />
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-neutral-100" />
          <div className="h-7 w-3/4 rounded bg-neutral-200" />
          <div className="h-8 w-32 rounded bg-neutral-100" />
          <div className="h-24 rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

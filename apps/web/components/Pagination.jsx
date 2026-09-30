import Link from "next/link";

export default function Pagination({ basePath, searchParams, pagination }) {
  if (!pagination || pagination.pages <= 1) return null;

  function hrefFor(page) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const { page, pages } = pagination;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 2
  );

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm hover:border-brand">
          আগে
        </Link>
      )}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center">
          {i > 0 && nums[i - 1] !== n - 1 && <span className="px-1 text-neutral-300">…</span>}
          <Link
            href={hrefFor(n)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              n === page ? "border-brand bg-brand text-white" : "border-neutral-200 hover:border-brand"
            }`}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={hrefFor(page + 1)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm hover:border-brand">
          পরে
        </Link>
      )}
    </div>
  );
}

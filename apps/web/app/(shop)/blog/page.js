import Link from "next/link";
import { blogApi } from "@/lib/content-client";

export default async function BlogListPage({ searchParams }) {
  const sp = await searchParams;
  const page = Number(sp.page || 1);
  const { data: posts, pagination } = await blogApi.list(page);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">ব্লগ ও নিউজ</h1>

      {posts.length === 0 ? (
        <p className="text-neutral-400">এখনো কোনো পোস্ট নেই।</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link key={p._id} href={`/blog/${p.slug}`} className="rounded-xl border border-neutral-200 overflow-hidden hover:border-brand">
              <div className="aspect-video bg-neutral-100">
                {p.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-neutral-800 line-clamp-2">{p.title}</h2>
                {p.excerpt && <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{p.excerpt}</p>}
                <div className="mt-2 text-xs text-neutral-400">
                  {p.authorName} · {new Date(p.publishedAt).toLocaleDateString("bn-BD")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination?.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={`/blog?page=${n}`} className={`rounded-md border px-3 py-1.5 text-sm ${n === page ? "border-brand bg-brand text-white" : "border-neutral-200"}`}>
              {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

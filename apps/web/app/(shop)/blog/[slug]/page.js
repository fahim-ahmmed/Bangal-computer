import { notFound } from "next/navigation";
import { blogApi } from "@/lib/content-client";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await blogApi.get(slug).catch(() => null);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt || post.title, images: post.coverImage ? [post.coverImage] : [], type: "article" },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await blogApi.get(slug).catch(() => null);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {post.coverImage && (
        <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-bold text-neutral-900">{post.title}</h1>
      <div className="mt-2 mb-8 text-sm text-neutral-400">
        {post.authorName} · {new Date(post.publishedAt).toLocaleDateString("bn-BD")}
      </div>
      {/* Admin-authored content — trusted (only admin/staff can write posts) */}
      <div className="prose max-w-none whitespace-pre-wrap text-neutral-700" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

"use client";

import { useEffect, useState } from "react";
import { UI } from "@/lib/admin-api";
import { blogApi } from "@/lib/content-client";

const EMPTY = { title: "", coverImage: "", excerpt: "", content: "", isPublished: false };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null); // null | post | "new"
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => blogApi.adminAll().then(setPosts).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  function openEdit(post) {
    setEditing(post || "new");
    setForm(post ? { title: post.title, coverImage: post.coverImage || "", excerpt: post.excerpt || "", content: post.content, isPublished: post.isPublished } : EMPTY);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing === "new") await blogApi.create(form);
      else await blogApi.update(editing._id, form);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const remove = (p) => window.confirm(`"${p.title}" মুছবেন?`) && blogApi.remove(p._id).then(load).catch((e) => alert(e.message));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">ব্লগ / নিউজ</h1>
        <button onClick={() => openEdit(null)} className={UI.btn}>+ নতুন পোস্ট</button>
      </div>

      {error && !editing && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p._id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-neutral-800">{p.title}</div>
              <div className="text-xs text-neutral-400">{p.isPublished ? "পাবলিশড" : "ড্রাফট"}</div>
            </div>
            <button onClick={() => openEdit(p)} className="text-sm text-brand hover:underline">এডিট</button>
            <button onClick={() => remove(p)} className="text-sm text-red-500 hover:underline">মুছুন</button>
          </div>
        ))}
        {posts.length === 0 && <p className="text-neutral-400">কোনো পোস্ট নেই।</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={save} className="my-6 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">{editing === "new" ? "নতুন পোস্ট" : "পোস্ট এডিট"}</h2>
            <div className="space-y-3">
              <input required className={UI.input} placeholder="টাইটেল" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <input className={UI.input} placeholder="কভার ইমেজ URL" value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} />
              <input className={UI.input} placeholder="সংক্ষিপ্ত বিবরণ (excerpt)" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
              <textarea required rows={10} className={UI.input} placeholder="পোস্টের বিস্তারিত লেখা (HTML/প্লেইন টেক্সট)" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
                পাবলিশড
              </label>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className={UI.btnGhost}>বাতিল</button>
              <button disabled={saving} className={UI.btn}>{saving ? "সেভ হচ্ছে..." : "সেভ করুন"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

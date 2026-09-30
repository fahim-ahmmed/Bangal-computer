"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, UI } from "@/lib/admin-api";
import { useSession } from "@/lib/auth-client";

const ROLE_LABEL = { customer: "কাস্টমার", staff: "স্টাফ", admin: "অ্যাডমিন" };

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      setUsers((await adminFetch(`/admin/users?${params}`)).data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeRole(u, role) {
    if (!window.confirm(`${u.email}-কে "${ROLE_LABEL[role]}" বানাবেন?`)) return;
    try {
      await adminFetch(`/admin/users/${u._id}/role`, { method: "PATCH", body: { role } });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-neutral-900">ইউজার ও রোল</h1>
      <form onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); }} className="mb-4 flex gap-2">
        <input className={`${UI.input} max-w-xs`} placeholder="নাম, ইমেইল বা ফোন" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className={UI.btnGhost}>খুঁজুন</button>
      </form>
      {error && <p className="mb-3 text-sm text-red-500">{error}{" "}(রোল পরিবর্তন শুধু অ্যাডমিন করতে পারেন)</p>}
      {loading && <p className="text-neutral-400">লোড হচ্ছে...</p>}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
            <tr><th className="p-3">নাম</th><th className="p-3">ইমেইল</th><th className="p-3">ফোন</th><th className="p-3">পয়েন্টস</th><th className="p-3">রোল</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-neutral-100">
                <td className="p-3">{u.name || "—"}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone || "—"}</td>
                <td className="p-3">{u.points ?? 0}</td>
                <td className="p-3">
                  <select className={`${UI.input} w-auto`} value={u.role || "customer"} onChange={(e) => changeRole(u, e.target.value)} disabled={session?.user?.id === String(u._id)}>
                    {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

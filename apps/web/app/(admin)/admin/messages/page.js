"use client";

import { useEffect, useState } from "react";
import { contactApi } from "@/lib/content-client";

const STATUS_LABEL = { new: "নতুন", read: "পঠিত", resolved: "সমাধান হয়েছে" };

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState(null);

  const load = () => contactApi.adminList(filter ? `?status=${filter}` : "").then(setMessages).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const setStatus = (m, status) => contactApi.setStatus(m._id, status).then(load).catch((e) => alert(e.message));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">যোগাযোগ / অভিযোগ ইনবক্স</h1>
        <select className="rounded-md border border-neutral-300 px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">সব</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m._id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <span className="font-semibold text-neutral-800">{m.name}</span>
                <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs">{m.type === "complaint" ? "অভিযোগ" : "যোগাযোগ"}</span>
                {m.orderId && <span className="ml-2 text-xs text-neutral-400">অর্ডার: {m.orderId}</span>}
              </div>
              <span className="text-xs text-neutral-400">{new Date(m.createdAt).toLocaleString("bn-BD")}</span>
            </div>
            <div className="mt-1 text-xs text-neutral-500">{m.email} {m.phone && `· ${m.phone}`}</div>
            {m.subject && <div className="mt-2 font-medium text-neutral-700">{m.subject}</div>}
            <p className="mt-1 text-sm text-neutral-600">{m.message}</p>
            <div className="mt-3 flex items-center gap-2">
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setStatus(m, k)}
                  className={`rounded-full px-3 py-1 text-xs ${m.status === k ? "bg-brand text-white" : "border border-neutral-300 text-neutral-600 hover:border-brand"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-neutral-400">কোনো মেসেজ নেই।</p>}
      </div>
    </div>
  );
}

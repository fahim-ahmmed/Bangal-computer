"use client";

import { useEffect, useState } from "react";
import { chatApi } from "@/lib/content-client";

export default function AdminChatPage() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("open");
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState(null);

  const load = () => chatApi.adminList(status).then(setTickets).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function sendReply(e) {
    e.preventDefault();
    if (!reply.trim() || !active) return;
    try {
      const updated = await chatApi.reply(active._id, reply.trim());
      setActive(updated);
      setReply("");
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  const close = (t) => chatApi.close(t._id).then(() => { setActive(null); load(); }).catch((e) => alert(e.message));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">লাইভ চ্যাট সাপোর্ট</h1>
        <select className="rounded-md border border-neutral-300 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">খোলা</option>
          <option value="closed">বন্ধ</option>
        </select>
      </div>
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-1">
          {tickets.map((t) => (
            <button
              key={t._id}
              onClick={() => setActive(t)}
              className={`block w-full rounded-lg border p-3 text-left text-sm ${active?._id === t._id ? "border-brand bg-brand/5" : "border-neutral-200 bg-white"}`}
            >
              <div className="font-medium text-neutral-800">{t.guestName || t.userId || "গেস্ট"}</div>
              <div className="line-clamp-1 text-xs text-neutral-500">{t.messages[t.messages.length - 1]?.text}</div>
            </button>
          ))}
          {tickets.length === 0 && <p className="text-neutral-400">কোনো টিকেট নেই।</p>}
        </div>

        <div className="md:col-span-2">
          {active ? (
            <div className="flex h-[28rem] flex-col rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-100 p-3">
                <span className="text-sm font-medium">{active.guestName || active.userId || "গেস্ট"}</span>
                {status === "open" && <button onClick={() => close(active)} className="text-xs text-red-500 hover:underline">বন্ধ করুন</button>}
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {active.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-sm ${m.sender === "admin" ? "bg-brand text-white" : "bg-neutral-100 text-neutral-800"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              {status === "open" && (
                <form onSubmit={sendReply} className="flex gap-2 border-t border-neutral-100 p-2">
                  <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="রিপ্লাই লিখুন..." className="flex-1 rounded-full border border-neutral-300 px-3 py-1.5 text-sm" />
                  <button className="rounded-full bg-brand px-4 text-sm text-white">পাঠান</button>
                </form>
              )}
            </div>
          ) : (
            <p className="text-neutral-400">একটা টিকেট বাছুন</p>
          )}
        </div>
      </div>
    </div>
  );
}

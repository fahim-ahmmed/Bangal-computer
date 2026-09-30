"use client";

import { useEffect, useRef, useState } from "react";
import { chatApi } from "@/lib/content-client";
import { useSession } from "@/lib/auth-client";

const STORAGE_KEY = "bc_chat_ticket_id";

export default function ChatWidget() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const pollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setTicketId(saved);
  }, []);

  useEffect(() => {
    if (!open || !ticketId) return;
    const poll = () => chatApi.get(ticketId).then(setTicket).catch(() => {});
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [open, ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages?.length]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      let data;
      if (ticketId) {
        data = await chatApi.send(ticketId, text.trim());
      } else {
        data = await chatApi.start(text.trim(), session?.user?.name);
        setTicketId(data._id);
        localStorage.setItem(STORAGE_KEY, data._id);
      }
      setTicket(data);
      setText("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      {open ? (
        <div className="flex h-[28rem] w-80 flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between rounded-t-2xl bg-brand px-4 py-3 text-white">
            <span className="font-semibold">লাইভ চ্যাট সাপোর্ট</span>
            <button onClick={() => setOpen(false)} className="text-xl leading-none">×</button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {!ticket && <p className="text-center text-sm text-neutral-400">নিচে মেসেজ লিখে শুরু করুন</p>}
            {ticket?.messages?.map((m, i) => (
              <div key={i} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm ${m.sender === "customer" ? "bg-brand text-white" : "bg-neutral-100 text-neutral-800"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-neutral-100 p-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="মেসেজ লিখুন..."
              className="flex-1 rounded-full border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
            />
            <button disabled={sending} type="submit" className="rounded-full bg-brand px-4 text-sm font-medium text-white disabled:opacity-50">
              পাঠান
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-lg hover:bg-brand-dark"
          aria-label="লাইভ চ্যাট খুলুন"
        >
          💬
        </button>
      )}
    </div>
  );
}

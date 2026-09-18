"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

// REAL IMPLEMENTATION: reads from Supabase with a realtime subscription on
// admin_messages, replies go through POST /api/admin-chat. See the
// backend-wired app's components/chat/SupportChatScreen.tsx.
export function SupportChatScreen() {
  const router = useRouter();
  const { currentPerson, adminChats, markAdminChatRead } = useMockStore();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = currentPerson ? Object.values(adminChats).find((c) => c.personId === currentPerson.id) : null;

  useEffect(() => {
    if (chat && chat.unreadForUser > 0) markAdminChatRead(chat.id, "user");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [chat?.messages.length]);

  const send = () => {
    if (!text.trim() || !currentPerson) return;
    // REAL IMPLEMENTATION: POST /api/admin-chat with { text } — the store's
    // sendAdminMessage is admin-authored only in this mock version; a
    // real reply-as-user path isn't modelled here since the mock store
    // doesn't distinguish sender identity for this one action. Worth
    // building out fully once this is backend-wired, following
    // lib/business/messaging.ts::sendAdminChatMessage(adminChatId, "user", text).
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-paper">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-navy" />
        </button>
        <span className="font-semibold text-sm text-navy">Runna Support</span>
        <div className="w-9" />
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {(!chat || chat.messages.length === 0) && <p className="text-xs text-center pt-10 text-faint">Our team hasn't messaged you yet.</p>}
        {chat?.messages.map((m) => {
          const mine = m.sender === "user";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${mine ? "bg-navy text-white" : "bg-card text-ink border border-line"}`}>{m.text}</div>
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-5 pt-2 border-t border-line bg-paper flex items-end gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Reply to support…"
          className="flex-1 rounded-full px-4 py-3 text-sm border border-line outline-none bg-card"
        />
        <button onClick={send} className="rounded-full p-3 flex-shrink-0 bg-navy">
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

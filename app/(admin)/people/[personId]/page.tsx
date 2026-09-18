"use client";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, ChevronDown } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

function reportTitle(reporter: string, reported: string, at: number) {
  const when = new Date(at).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  return `${reporter} reported ${reported} — ${when}`;
}

export default function AdminPersonChatPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = use(params);
  const router = useRouter();
  const { people, adminReports, adminChats, setPersonBlocked, sendAdminMessage, markAdminChatRead } = useMockStore();
  const [showReports, setShowReports] = useState(true);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const person = people.find((p) => p.id === personId);
  const chat = Object.values(adminChats).find((c) => c.personId === personId);
  const reportsAgainst = adminReports.filter((r) => r.reportedId === personId);

  useEffect(() => {
    if (chat && chat.unreadForAdmin > 0) markAdminChatRead(chat.id, "admin");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [chat?.messages.length]);

  if (!person) return null;

  const send = () => {
    if (!text.trim()) return;
    sendAdminMessage(personId, text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-paper">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-navy" />
        </button>
        <span className="font-semibold text-sm text-navy">{person.name} #{person.code} ({person.type})</span>
        <div className="w-9" />
      </div>

      <div className="px-4 pt-3">
        <button
          onClick={() => setPersonBlocked(personId, !person.isBlocked)}
          className="w-full rounded-lg py-2 text-xs font-semibold"
          style={{ background: person.isBlocked ? "#E7F3EC" : "#FBEAE8", color: person.isBlocked ? "#2E8B63" : "#B8463C" }}
        >
          {person.isBlocked ? `Unblock ${person.name}` : `Block ${person.name}`}
        </button>
      </div>

      <div className="px-4 pt-3">
        <button onClick={() => setShowReports(!showReports)} className="w-full flex items-center justify-between">
          <span className="text-xs font-semibold text-sub">Reports against this user — private, {person.name} can't see this ({reportsAgainst.length})</span>
          <ChevronDown size={14} className="text-sub" style={{ transform: showReports ? "rotate(180deg)" : "none" }} />
        </button>
        {showReports && (
          <div className="mt-2 space-y-2">
            {reportsAgainst.length === 0 && <p className="text-[11px] text-faint">No reports against this user.</p>}
            {reportsAgainst.map((r) => {
              const reporter = people.find((p) => p.id === r.reporterId);
              return (
                <div key={r.id} className="rounded-lg px-3 py-2.5 bg-redBg">
                  <p className="text-xs font-semibold text-red">{reportTitle(`${reporter?.name} #${reporter?.code} (${reporter?.type})`, `${person.name} #${person.code} (${person.type})`, r.at)}</p>
                  <p className="text-xs mt-1 text-ink">{r.message}</p>
                  <span className="text-[10px] font-semibold text-faint">{r.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {(!chat || chat.messages.length === 0) && <p className="text-xs text-center pt-10 text-faint">No messages yet — say hello.</p>}
        {chat?.messages.map((m) => {
          const mine = m.sender === "admin";
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
          placeholder="Message this user…"
          className="flex-1 rounded-full px-4 py-3 text-sm border border-line outline-none bg-card"
        />
        <button onClick={send} className="rounded-full p-3 flex-shrink-0 bg-navy">
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

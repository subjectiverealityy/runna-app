"use client";
import { ShieldCheck } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

export default function RunnerMessagesPage() {
  const { currentPerson, chats, people, adminChats } = useMockStore();
  if (!currentPerson) return null;

  const myChats = Object.values(chats)
    .filter((c) => c.runnerId === currentPerson.id)
    .map((c) => {
      const orderer = people.find((p) => p.id === c.ordererId) ?? null;
      const last = c.messages[c.messages.length - 1];
      const preview = last?.type === "price" ? `Price sent · ₦${last.price}` : last?.type === "request" ? `Request · ${last.items}` : last?.text ?? "";
      return { ...c, orderer, preview };
    });

  const supportChat = Object.values(adminChats).find((c) => c.personId === currentPerson.id);

  return (
    <div className="px-4 py-4 space-y-2 overflow-y-auto h-full">
      {supportChat && (
        <a href="/messages/support" className="w-full text-left rounded-xl p-3.5 border-2 border-amber bg-amber/10 flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-amberDeep flex-shrink-0" />
          <p className="text-sm font-semibold text-navy flex-1">Runna Support</p>
          {supportChat.unreadForUser > 0 && <span className="rounded-full text-[10px] font-bold px-1.5 py-0.5 bg-red text-white">{supportChat.unreadForUser}</span>}
        </a>
      )}
      {myChats.length === 0 && !supportChat && <p className="text-xs text-center pt-10 text-faint">No conversations yet.</p>}
      {myChats.map((c) => (
        <a key={c.id} href={`/messages/${c.id}`} className="w-full text-left rounded-xl p-3.5 border border-line bg-card flex items-center justify-between block">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy">
              {c.orderer?.name} <span className="font-mono text-xs font-normal text-faint">#{c.orderer?.code}</span>
            </p>
            <p className="text-xs truncate mt-0.5 text-sub">{c.preview}</p>
          </div>
          {c.unreadForRunner > 0 && <span className="rounded-full text-[10px] font-bold px-1.5 py-0.5 bg-red text-white">{c.unreadForRunner}</span>}
        </a>
      ))}
    </div>
  );
}

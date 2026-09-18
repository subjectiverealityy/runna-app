"use client";
import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

export default function OrdererMessagesPage() {
  const { currentPerson, chats, people, adminChats, toggleStar } = useMockStore();
  if (!currentPerson) return null;

  const myChats = Object.values(chats)
    .filter((c) => c.ordererId === currentPerson.id)
    .map((c) => {
      const runner = people.find((p) => p.id === c.runnerId) ?? null;
      const last = c.messages[c.messages.length - 1];
      const preview = last?.type === "price" ? `Price sent · ₦${last.price}` : last?.type === "request" ? `Request · ${last.items}` : last?.text ?? "";
      return { ...c, runner, preview };
    });

  const supportChat = Object.values(adminChats).find((c) => c.personId === currentPerson.id);

  return (
    <div className="px-4 py-4 space-y-2 overflow-y-auto h-full">
      {supportChat && (
        <Link href="/orderer-messages/support" className="w-full text-left rounded-xl p-3.5 border-2 border-amber bg-amber/10 flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-amberDeep flex-shrink-0" />
          <p className="text-sm font-semibold text-navy flex-1">Runna Support</p>
          {supportChat.unreadForUser > 0 && <span className="rounded-full text-[10px] font-bold px-1.5 py-0.5 bg-red text-white">{supportChat.unreadForUser}</span>}
        </Link>
      )}
      {myChats.length === 0 && !supportChat && <p className="text-xs text-center pt-10 text-faint">No conversations yet.</p>}
      {myChats.map((c) => (
        <div key={c.id} className="w-full rounded-xl p-3.5 border border-line bg-card flex items-center gap-2">
          <Link href={`/orderer-messages/${c.id}`} className="flex-1 min-w-0 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy">
                {c.runner?.name} <span className="font-mono text-xs font-normal text-faint">#{c.runner?.code}</span>
              </p>
              <p className="text-xs truncate mt-0.5 text-sub">{c.preview}</p>
            </div>
            {c.unreadForOrderer > 0 && <span className="rounded-full text-[10px] font-bold px-1.5 py-0.5 bg-red text-white flex-shrink-0 ml-2">{c.unreadForOrderer}</span>}
          </Link>
          {c.runner && (
            <button onClick={() => toggleStar(c.runner!.id)} className="p-1 flex-shrink-0">
              <Star size={15} className={currentPerson.starredRunnerIds.includes(c.runner.id) ? "text-amber fill-amber" : "text-faint"} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

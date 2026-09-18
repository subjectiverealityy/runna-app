"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMockStore } from "@/lib/mock/store";

export default function PeoplePage() {
  const router = useRouter();
  const { people, campuses, adminChats, setPersonBlocked } = useMockStore();
  const [query, setQuery] = useState("");
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);

  const campusName = (id: string | null) => campuses.find((c) => c.id === id)?.name ?? "—";
  const cleanedQuery = query.trim().replace(/#/g, "");

  const results = showBlockedOnly
    ? people.filter((p) => p.isBlocked)
    : cleanedQuery
      ? people.filter((p) => p.code.includes(cleanedQuery))
      : [];

  const inbox = Object.values(adminChats)
    .map((c) => ({ ...c, person: people.find((p) => p.id === c.personId) }))
    .sort((a, b) => (b.messages[b.messages.length - 1]?.at ?? 0) - (a.messages[a.messages.length - 1]?.at ?? 0));

  return (
    <div className="px-4 py-4 space-y-4 overflow-y-auto h-full">
      <div className="flex gap-2">
        <button onClick={() => setShowBlockedOnly(false)} className={`flex-1 rounded-lg py-2 text-xs font-semibold border border-line ${!showBlockedOnly ? "bg-navy text-white" : "bg-card text-sub"}`}>Search</button>
        <button onClick={() => setShowBlockedOnly(true)} className={`flex-1 rounded-lg py-2 text-xs font-semibold border border-line ${showBlockedOnly ? "bg-red text-white" : "bg-card text-sub"}`}>Blocked</button>
      </div>
      {!showBlockedOnly && (
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by code — runner or orderer" className="w-full rounded-xl px-3 py-2.5 text-sm border border-line bg-card font-mono" />
      )}

      {(showBlockedOnly || query.trim()) && (
        <div className="space-y-2">
          {results.length === 0 && <p className="text-xs text-faint">{showBlockedOnly ? "Nobody is currently blocked." : "No match."}</p>}
          {results.map((p) => (
            <div key={p.id} className="rounded-xl p-3.5 border border-line bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {p.name} <span className="font-mono text-xs font-normal text-faint">#{p.code}</span> <span className="text-xs font-normal text-faint">({p.type})</span>
                  </p>
                  <p className={`text-xs ${p.isBlocked ? "text-red" : "text-sub"}`}>{campusName(p.campusId)}{p.type === "runner" && ` · ${p.status}`}</p>
                </div>
                <button onClick={() => router.push(`/people/${p.id}`)} className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-navy text-white">Message</button>
              </div>
              {p.isBlocked && (
                <button onClick={() => setPersonBlocked(p.id, false)} className="text-xs font-semibold mt-2 text-green">Unblock {p.name}</button>
              )}
            </div>
          ))}
        </div>
      )}

      {!showBlockedOnly && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-faint">Inbox</p>
          {inbox.length === 0 && <p className="text-xs text-faint">No conversations yet.</p>}
          <div className="space-y-2">
            {inbox.map((c) => (
              <a key={c.id} href={`/people/${c.personId}`} className="w-full text-left rounded-xl p-3.5 border border-line bg-card flex items-start justify-between block">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">
                    {c.person?.name} <span className="font-mono text-xs font-normal text-faint">#{c.person?.code}</span> <span className="text-xs font-normal text-faint">({c.person?.type})</span>
                  </p>
                  <p className="text-[11px] text-faint">{campusName(c.person?.campusId ?? null)}</p>
                </div>
                {c.unreadForAdmin > 0 && <span className="rounded-full text-[10px] font-bold px-1.5 py-0.5 bg-red text-white">{c.unreadForAdmin}</span>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

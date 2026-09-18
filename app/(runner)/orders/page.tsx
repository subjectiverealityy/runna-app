"use client";
import { useState } from "react";
import { Copy } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { fulfilmentLabel, formatTime12h } from "@/lib/format";

interface OrderRow {
  price: any;
  request: any;
  chat: any;
  orderer: any;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error("clipboard API unavailable");
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

// REAL IMPLEMENTATION: orders list is a Supabase read (chats + messages
// for this runner, filtered to confirmed/fulfilled prices) — see the
// backend-wired app's app/(runner)/orders/page.tsx. The status toggle
// calls POST /api/settings, which re-checks isBlocked server-side (never
// trust the disabled attribute alone — see lib/business's settings route).
export default function RunnerOrdersPage() {
  const { currentPerson, chats, people, toggleRunnerStatus, vendors, destinations } = useMockStore();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  if (!currentPerson) return null;

  const resolveVendorName = (id: string | null) => {
    if (!id) return "Vendor";
    if (currentPerson.selfVendorName && id === currentPerson.selfVendorName) return id;
    return vendors.find((v) => v.id === id)?.name ?? id;
  };
  const resolveDestinationName = (id: string | null) => {
    if (!id) return "Destination";
    if (id === "on_location") return "On location";
    if (currentPerson.selfVendorLocation && id === currentPerson.selfVendorLocation) return id;
    return destinations.find((d) => d.id === id)?.name ?? id;
  };

  const orders = Object.values(chats)
    .filter((c) => c.runnerId === currentPerson.id)
    .flatMap((chat) =>
      chat.messages
        .filter((m) => m.type === "price" && (m.priceStatus === "confirmed" || m.priceStatus === "fulfilled"))
        .map((price) => ({
          price,
          request: chat.messages.find((r) => r.type === "request" && r.id === price.requestId) ?? null,
          chat,
          orderer: people.find((p) => p.id === chat.ordererId) ?? null,
        }))
    )
    .sort((a, b) => {
      const rank = (o: typeof a) => (o.price.priceStatus === "fulfilled" ? 1 : 0);
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return (a.request?.deliveryTime ?? "").localeCompare(b.request?.deliveryTime ?? "");
    });

  const toDeliver = orders.filter((o) => o.price.priceStatus !== "fulfilled");
  const delivered = orders.filter((o) => o.price.priceStatus === "fulfilled");

  const copyCode = async () => {
    const ok = await copyToClipboard(currentPerson.code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } else {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 1800);
    }
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="rounded-xl p-4 flex items-center justify-between bg-navy">
          <div>
            <p className="text-[11px]" style={{ color: "#B9C0D1" }}>{currentPerson.name}</p>
            <button onClick={copyCode} className="flex items-center gap-1.5 mt-1">
              <span className="font-mono text-sm text-white">#{currentPerson.code}</span>
              <Copy size={12} color="#B9C0D1" />
              {copied && <span className="text-[10px] text-amber">Copied</span>}
              {copyFailed && <span className="text-[10px] text-red">Couldn't copy — select manually</span>}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRunnerStatus}
              disabled={currentPerson.status === "offline" && currentPerson.isBlocked}
              className="rounded-full p-0.5 flex text-xs font-semibold"
              style={{ background: "#141C30" }}
            >
              <span className="px-3 py-1.5 rounded-full" style={{ background: currentPerson.status === "offline" ? "#F9F7F1" : "transparent", color: currentPerson.status === "offline" ? "#1E2A4A" : "#5B6478" }}>Offline</span>
              <span className="px-3 py-1.5 rounded-full" style={{ background: currentPerson.status === "online" ? "#2E8B63" : "transparent", color: currentPerson.status === "online" ? "#fff" : "#5B6478" }}>Online</span>
            </button>
          </div>
        </div>
        {currentPerson.isBlocked && <p className="text-xs mt-1.5 text-red">Your account is blocked — check Runna Support for details.</p>}
      </div>

      <div className="px-4 py-2 space-y-2.5">
        {orders.length === 0 && <p className="text-xs text-center pt-10 text-faint">Confirmed orders will show up here once an orderer pays.</p>}
        {toDeliver.length > 0 && <p className="text-[11px] font-semibold uppercase tracking-wide text-faint px-1">To deliver</p>}
        {toDeliver.map(({ price, request, chat, orderer }) => (
          <a key={price.id} href={`/runner-messages/${chat.id}`} className="block rounded-xl p-3.5 border border-line bg-card">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-navy">{resolveVendorName(request?.vendorId ?? null)}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FDF1DC] text-amberDeep">To deliver</span>
            </div>
            <p className="text-xs text-sub">
              {resolveDestinationName(request?.destinationId ?? null)} · {fulfilmentLabel(request?.fulfilmentType ?? null)} · {formatTime12h(request?.deliveryTime)}
            </p>
            {price.items && (
              <p className="text-xs mt-1 text-ink">
                <span className="font-semibold">Items: </span>
                {price.items}
              </p>
            )}
            {price.note && <p className="text-xs mt-1 italic text-sub">"{price.note}"</p>}
            <p className="text-xs mt-1 text-ink">For {orderer?.name} · code <span className="font-mono">{price.fulfilmentCode}</span></p>
          </a>
        ))}
        {delivered.length > 0 && <p className="text-[11px] font-semibold uppercase tracking-wide text-faint px-1 pt-2">Delivered</p>}
        {delivered.map(({ price, request, chat, orderer }) => (
          <a key={price.id} href={`/runner-messages/${chat.id}`} className="block rounded-xl p-3.5 border border-line bg-card opacity-70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-navy">{resolveVendorName(request?.vendorId ?? null)}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-greenBg text-green">Delivered</span>
            </div>
            <p className="text-xs text-sub">
              {resolveDestinationName(request?.destinationId ?? null)} · {fulfilmentLabel(request?.fulfilmentType ?? null)} · {formatTime12h(request?.deliveryTime)}
            </p>
            {price.items && (
              <p className="text-xs mt-1 text-ink">
                <span className="font-semibold">Items: </span>
                {price.items}
              </p>
            )}
            <p className="text-xs mt-1 text-ink">For {orderer?.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

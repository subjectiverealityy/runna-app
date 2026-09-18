"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Send, Clock, MoreVertical } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { RequestCard } from "./RequestCard";
import { PriceCard } from "./PriceCard";
import { RequestModal } from "./RequestModal";
import { PriceModal } from "./PriceModal";
import { ReportModal } from "./ReportModal";
import type { Message, FulfilmentType } from "@/types/mock";

function fulfilmentLabel(type: FulfilmentType | null) {
  if (type === "delivery-room") return "Delivery to room";
  if (type === "delivery-front") return "Delivery to hostel front";
  if (type === "pickup") return "Pickup";
  return "";
}

// REAL IMPLEMENTATION: reads come from Supabase directly (with a realtime
// subscription on the chat's messages), writes go through the API routes
// listed in each handler below — see the backend-wired app's
// components/chat/ChatScreen.tsx, which this file is structurally
// identical to. The only thing that changes is where the data comes from
// and where actions go; the UI, the layout, and the interaction logic are
// meant to carry over directly.
export function ChatScreen({ chatId, role }: { chatId: string; role: "runner" | "orderer" }) {
  const router = useRouter();
  const store = useMockStore();
  const { chats, people, currentPerson, vendors: VENDORS, destinations: DESTINATIONS } = store;
  const isRunner = role === "runner";
  const chat = chats[chatId];
  const other = chat ? people.find((p) => p.id === (isRunner ? chat.ordererId : chat.runnerId)) : null;
  const runnerForThisChat = chat ? people.find((p) => p.id === chat.runnerId) : null;

  const [text, setText] = useState("");
  const [showRequestModal, setShowRequestModal] = useState<{ seed: Partial<Message> | null; isEdit: boolean } | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>({});
  const [codeErrors, setCodeErrors] = useState<Record<string, boolean>>({});
  const [hint, setHint] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const vendors = useMemo(() => VENDORS.filter((v) => runnerForThisChat?.vendorIds.includes(v.id)), [runnerForThisChat]);
  const destinations = useMemo(() => DESTINATIONS.filter((d) => runnerForThisChat?.destinationIds.includes(d.id)), [runnerForThisChat]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [chat?.messages.length]);

  if (!chat || !other || !currentPerson) return null;

  const currentRequest = [...chat.messages].reverse().find((m) => m.type === "request") ?? null;
  const currentPrice = currentRequest ? [...chat.messages].reverse().find((m) => m.type === "price" && m.requestId === currentRequest.id) : null;
  const requestBlocking = currentRequest?.requestStatus === "locked" && currentPrice?.priceStatus !== "fulfilled";
  const chatLocked = Boolean(chat.lockedUntil && chat.lockedUntil > store.now);
  const remaining = chat.countdownEndsAt ? Math.max(0, chat.countdownEndsAt - store.now) : 0;
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const plusEnabled = isRunner
    ? Boolean(currentRequest && currentRequest.requestStatus === "open" && !currentPerson.isBlocked)
    : other.status !== "offline" && !requestBlocking && !(currentPerson.isBlocked && !(currentRequest?.requestStatus === "open"));

  const resolveVendorName = (id: string | null) => {
    if (!id) return "Vendor";
    if (runnerForThisChat?.selfVendorName && id === runnerForThisChat.selfVendorName) return id;
    return VENDORS.find((v) => v.id === id)?.name ?? id;
  };
  const resolveDestinationName = (id: string | null) => {
    if (!id) return "Destination";
    if (id === "on_location") return "On location";
    if (runnerForThisChat?.selfVendorLocation && id === runnerForThisChat.selfVendorLocation) return id;
    return DESTINATIONS.find((d) => d.id === id)?.name ?? id;
  };

  const flash = (msg: string) => {
    setHint(msg);
    setTimeout(() => setHint(null), 3000);
  };

  const sendText = () => {
    if (!text.trim()) return;
    store.sendChatMessage(chatId, text.trim());
    setText("");
  };

  const submitRequest = (fields: { vendorId: string; destinationId: string; fulfilmentType: FulfilmentType; items: string; deliveryTime: string; note?: string }) => {
    try {
      store.submitRequest(chatId, fields);
      setShowRequestModal(null);
    } catch (err) {
      flash((err as Error).message);
      setShowRequestModal(null);
    }
  };

  const handlePlusClick = () => {
    if (isRunner) {
      if (!currentRequest || currentRequest.requestStatus !== "open") return flash("No open request waiting on a price right now.");
      if (currentPerson.isBlocked) return flash("Your account is blocked — you can't send a new price.");
      setShowPriceModal(true);
    } else {
      if (other.status === "offline") return flash(`${other.name} is offline — you can't send a request until they're back online.`);
      if (requestBlocking) return flash("Can't edit while a price is out — reject it first if you need to change your request.");
      setShowRequestModal({ seed: currentRequest?.requestStatus === "open" ? currentRequest : null, isEdit: currentRequest?.requestStatus === "open" });
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-paper relative">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-navy" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-sm text-navy">
            {other.name} #{other.code}
          </span>
          {chat.countdownEndsAt && remaining > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={10} className="text-red" />
              <span className="font-mono text-[10px] font-semibold text-red">
                {mm}:{String(ss).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 -mr-1">
            <MoreVertical size={18} className="text-navy" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-20 rounded-lg border border-line bg-paper shadow-lg py-1 min-w-[140px]">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowReportModal(true);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-red"
              >
                Report {other.name}
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {chat.messages.map((m) => {
          if (m.type === "system") {
            return (
              <div key={m.id} className="text-center">
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#EEEEEE] text-sub">{m.text}</span>
              </div>
            );
          }
          if (m.type === "request") {
            return (
              <div key={m.id} className="flex justify-start">
                <RequestCard
                  request={m}
                  vendorName={resolveVendorName(m.vendorId)}
                  destinationName={resolveDestinationName(m.destinationId)}
                  fulfilmentLabel={fulfilmentLabel(m.fulfilmentType)}
                  viewer={role}
                  chatLocked={chatLocked}
                  onEdit={() => setShowRequestModal({ seed: m, isEdit: true })}
                  onSendPrice={() => setShowPriceModal(true)}
                />
              </div>
            );
          }
          if (m.type === "price") {
            return (
              <div key={m.id} className="flex justify-end">
                <PriceCard
                  price={m}
                  viewer={role}
                  walletBalance={!isRunner ? currentPerson.walletBalance : 0}
                  onAccept={() => store.acceptPrice(chatId, m.id)}
                  onReject={() => store.rejectPrice(chatId, m.id)}
                  onCancel={() => store.cancelPrice(chatId, m.id)}
                  onSubmitCode={(code) => {
                    const matched = store.submitFulfilmentCode(chatId, m.id, code);
                    setCodeErrors((prev) => ({ ...prev, [m.id]: !matched }));
                  }}
                  codeDraft={codeDrafts[m.id] ?? ""}
                  onCodeDraftChange={(v) => setCodeDrafts((prev) => ({ ...prev, [m.id]: v }))}
                  codeError={codeErrors[m.id]}
                />
              </div>
            );
          }
          const mine = m.sender === role;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${mine ? "bg-navy text-white" : "bg-card text-ink border border-line"}`}>{m.text}</div>
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-5 pt-2 border-t border-line bg-paper">
        {chatLocked ? (
          <div className="rounded-xl px-3.5 py-3 text-center bg-redBg">
            <p className="text-xs font-medium text-red">This chat is locked and will reopen automatically.</p>
          </div>
        ) : (
          <>
            {hint && <p className="text-[11px] mb-2 text-red">{hint}</p>}
            <div className="flex items-end gap-2">
              <button onClick={handlePlusClick} className="rounded-full p-3 flex-shrink-0" style={{ background: plusEnabled ? "#F2A93B" : "#E4E0D3" }}>
                <Plus size={18} className={plusEnabled ? "text-navyDeep" : "text-faint"} />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendText()}
                placeholder={isRunner ? "Chat, or tap + to send a price" : "Chat, or tap + to request an order"}
                className="flex-1 rounded-full px-4 py-3 text-sm border border-line outline-none bg-card"
              />
              <button onClick={sendText} className="rounded-full p-3 flex-shrink-0 bg-navy">
                <Send size={16} className="text-white" />
              </button>
            </div>
          </>
        )}
      </div>

      {showRequestModal && !isRunner && runnerForThisChat && (
        <RequestModal
          runner={runnerForThisChat}
          vendors={vendors}
          destinations={destinations}
          seed={showRequestModal.seed}
          isEdit={showRequestModal.isEdit}
          onClose={() => setShowRequestModal(null)}
          onSubmit={submitRequest}
        />
      )}
      {showPriceModal && isRunner && (
        <PriceModal
          onClose={() => setShowPriceModal(false)}
          onSubmit={(price) => {
            store.sendPrice(chatId, price);
            setShowPriceModal(false);
          }}
        />
      )}
      {showReportModal && (
        <ReportModal
          otherName={other.name}
          onClose={() => setShowReportModal(false)}
          onSubmit={(message) => store.fileReport(chatId, other.id, message)}
        />
      )}
    </div>
  );
}

"use client";
// The mock store — everything the app reads and writes lives here, as
// in-memory React state. This is the ONE file that gets replaced when this
// becomes the real, backend-wired app: every action function below has a
// comment on it describing the real implementation (which API route to
// create, which validation it needs) — written to match the equivalent
// lib/business/*.ts file in the backend-wired build 1:1, so porting a
// screen later is "swap this function's body for a fetch() call," not a
// redesign.
//
// Everything here runs client-side only. Refresh the page and it resets to
// the seed data in lib/mock/data.ts — there is no persistence, exactly like
// the original prototype.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Person, Chat, Message, Report, Feedback, AdminChat, FulfilmentType, PersonType, DeliverTo, Campus, Vendor, Destination } from "@/types/mock";
import { MOCK_RUNNERS, MOCK_ORDERERS, MOCK_ADMIN, CAMPUSES, VENDORS, DESTINATIONS, seedChats, uid } from "./data";

const RESPONSE_WINDOW_MS = 5 * 60 * 1000;
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000;
const MISS_WINDOW_MS = 30 * 60 * 1000;
const MISS_THRESHOLD = 3;
const ON_LOCATION = "on_location";

function blankMessage(partial: Partial<Message> & Pick<Message, "chatId" | "type">): Message {
  return {
    id: uid(), sender: null, text: null, at: Date.now(),
    vendorId: null, destinationId: null, fulfilmentType: null, items: null, deliveryTime: null, note: null, requestStatus: null,
    requestId: null, price: null, priceStatus: null, confirmedAt: null, fulfilmentCode: null, codeEnteredByRunner: null, paidVia: null, adminNotifiedAt: null,
    ...partial,
  };
}

interface Store {
  // ── identity — stands in for real auth ──────────────────────────────
  currentPersonId: string | null;
  currentPerson: Person | null;
  signInAs: (personId: string) => void;
  signOut: () => void;

  // ── data ──────────────────────────────────────────────────────────
  people: Person[];
  chats: Record<string, Chat>;
  adminReports: Report[];
  appFeedback: Feedback[];
  adminChats: Record<string, AdminChat>;
  campuses: Campus[];
  vendors: Vendor[];
  destinations: Destination[];
  now: number;

  // ── onboarding ────────────────────────────────────────────────────
  finishRunnerOnboarding: (fields: {
    name: string; campusId: string; vendorIds: string[]; destinationIds: string[];
    canDeliver: boolean; canPickup: boolean; deliverTo: DeliverTo[];
    selfVendorName?: string; selfVendorLocation?: string;
  }) => string;
  finishOrdererOnboarding: (fields: { name: string; campusId: string }) => string;

  // ── runner ────────────────────────────────────────────────────────
  toggleRunnerStatus: () => void;
  updateRunnerProfile: (fields: Partial<Person>) => void;

  // ── requests / prices / fulfilment ───────────────────────────────
  findOrCreateChat: (runnerId: string, prefill?: Chat["prefill"]) => string;
  submitRequest: (chatId: string, fields: {
    vendorId: string; destinationId: string; fulfilmentType: FulfilmentType;
    items: string; deliveryTime: string; note?: string;
  }) => void;
  rejectRequest: (chatId: string) => void;
  sendPrice: (chatId: string, price: number) => void;
  acceptPrice: (chatId: string, priceId: string) => void;
  rejectPrice: (chatId: string, priceId: string) => void;
  cancelPrice: (chatId: string, priceId: string) => void;
  submitFulfilmentCode: (chatId: string, priceId: string, code: string) => boolean;
  sendChatMessage: (chatId: string, text: string) => void;

  // ── orderer extras ────────────────────────────────────────────────
  toggleStar: (runnerId: string) => void;
  topUpWallet: (amount: number) => void;

  // ── trust & moderation ────────────────────────────────────────────
  fileReport: (chatId: string, reportedId: string, message: string) => void;
  submitFeedback: (message: string) => void;

  // ── admin ─────────────────────────────────────────────────────────
  resolveReport: (reportId: string, status: "dismissed" | "actioned") => void;
  setPersonBlocked: (personId: string, blocked: boolean, reportId?: string) => void;
  markFeedbackReviewed: (feedbackId: string) => void;
  sendAdminMessage: (personId: string, text: string) => void;
  markAdminChatRead: (adminChatId: string, by: "user" | "admin") => void;
  addCampus: (name: string) => void;
  toggleCampusActive: (id: string) => void;
  addVendor: (campusId: string, name: string) => void;
  toggleVendorActive: (id: string) => void;
  addDestination: (campusId: string, name: string) => void;
  toggleDestinationActive: (id: string) => void;
}

const StoreContext = createContext<Store | null>(null);

export function useMockStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useMockStore must be used within MockStoreProvider");
  return ctx;
}

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [currentPersonId, setCurrentPersonId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([...MOCK_RUNNERS, ...MOCK_ORDERERS, MOCK_ADMIN]);
  const [chats, setChats] = useState<Record<string, Chat>>(() => seedChats());
  const [adminReports, setAdminReports] = useState<Report[]>([]);
  const [appFeedback, setAppFeedback] = useState<Feedback[]>([]);
  const [adminChats, setAdminChats] = useState<Record<string, AdminChat>>({});
  const [campuses, setCampuses] = useState<Campus[]>(CAMPUSES);
  const [vendors, setVendors] = useState<Vendor[]>(VENDORS);
  const [destinations, setDestinations] = useState<Destination[]>(DESTINATIONS);
  const [now, setNow] = useState(Date.now());
  const [runnerMissLog, setRunnerMissLog] = useState<Record<string, number[]>>({});

  const currentPerson = people.find((p) => p.id === currentPersonId) ?? null;

  // ── the ticking clock, and the ONE thing an elapsed countdown does ──
  // REAL IMPLEMENTATION: this whole effect becomes four separate
  // pg_cron-triggered API routes — see the backend-wired app's
  // lib/business/scheduled.ts (expireCountdowns, unlockChats,
  // escalateStuckOrders, pruneOldRunnerMisses). None of this can stay a
  // setInterval once this app has real users, since it only fires while
  // this exact browser tab is open — that's the single most important
  // thing to change when wiring up the backend.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const expiring = Object.values(chats).filter((c) => c.countdownEndsAt && now >= c.countdownEndsAt);
    const unlocking = Object.values(chats).filter((c) => c.lockedUntil && now >= c.lockedUntil);
    if (expiring.length === 0 && unlocking.length === 0) return;

    setChats((prev) => {
      const next = { ...prev };
      expiring.forEach((c) => {
        // c came from Object.values(chats), so it's already a real Chat —
        // use it directly instead of re-indexing next[c.id], which
        // TypeScript can't know is defined (noUncheckedIndexedAccess).
        next[c.id] = {
          ...c,
          countdownEndsAt: null,
          lockedUntil: Date.now() + LOCK_DURATION_MS,
          messages: [...c.messages, blankMessage({ chatId: c.id, type: "system", text: "This chat is locked because there was no response from the runner within 5 minutes" })],
        };
      });
      unlocking.forEach((c) => {
        if (c.lockedUntil && now >= c.lockedUntil) {
          next[c.id] = { ...c, lockedUntil: null, messages: [...c.messages, blankMessage({ chatId: c.id, type: "system", text: "This chat has reopened." })] };
        }
      });
      return next;
    });

    // Missed-countdown tracking: 3 within 30 minutes takes the runner
    // offline. REAL IMPLEMENTATION: a durable runner_misses table, not an
    // in-memory array — see the schema comment in the backend-wired app.
    expiring.forEach((c) => {
      setRunnerMissLog((prev) => {
        const cutoff = Date.now() - MISS_WINDOW_MS;
        const kept = (prev[c.runnerId] || []).filter((t) => t > cutoff);
        kept.push(Date.now());
        if (kept.length >= MISS_THRESHOLD) {
          setPeople((people) => people.map((p) => (p.id === c.runnerId ? { ...p, status: "offline" } : p)));
          return { ...prev, [c.runnerId]: [] };
        }
        return { ...prev, [c.runnerId]: kept };
      });
    });
  }, [now, chats]);

  // ── identity ─────────────────────────────────────────────────────
  // REAL IMPLEMENTATION: Google OAuth via Supabase Auth. See the
  // backend-wired app's app/(auth)/sign-in/page.tsx and
  // app/auth/callback/route.ts. There is no server here to redirect to, so
  // this just sets which mock person you're "logged in" as.
  const signInAs = (personId: string) => setCurrentPersonId(personId);
  const signOut = () => setCurrentPersonId(null);

  // ── onboarding ───────────────────────────────────────────────────
  // REAL IMPLEMENTATION: POST /api/onboarding/runner — validates the same
  // minimum-viable-profile rule (at least one vendor source, at least one
  // fulfilment method, a destination if delivery's offered) server-side
  // before inserting, and checks the person doesn't already have a
  // profile. See lib/business/onboarding.ts::createRunnerProfile.
  const finishRunnerOnboarding: Store["finishRunnerOnboarding"] = (fields) => {
    const id = "new_runner_" + uid();
    const newRunner: Person = {
      id, type: "runner", code: String(100000 + Math.floor(Math.random() * 899999)),
      name: fields.name, campusId: fields.campusId,
      vendorIds: fields.vendorIds, destinationIds: fields.destinationIds,
      canDeliver: fields.canDeliver, canPickup: fields.canPickup, deliverTo: fields.deliverTo,
      status: "offline", isBlocked: false, payoutAccount: "Flutterwave — linked",
      selfVendorName: fields.selfVendorName || null, selfVendorLocation: fields.selfVendorLocation || null,
      starredRunnerIds: [], walletBalance: 0,
    };
    setPeople((prev) => [...prev, newRunner]);
    setCurrentPersonId(id);
    return id;
  };

  // REAL IMPLEMENTATION: POST /api/onboarding/orderer — see
  // lib/business/onboarding.ts::createOrdererProfile.
  const finishOrdererOnboarding: Store["finishOrdererOnboarding"] = (fields) => {
    const id = "new_orderer_" + uid();
    const newOrderer: Person = {
      id, type: "orderer", code: String(100000 + Math.floor(Math.random() * 899999)),
      name: fields.name, campusId: fields.campusId,
      vendorIds: [], destinationIds: [], canDeliver: false, canPickup: false, deliverTo: [],
      status: "offline", isBlocked: false, payoutAccount: null, selfVendorName: null, selfVendorLocation: null,
      starredRunnerIds: [], walletBalance: 0,
    };
    setPeople((prev) => [...prev, newOrderer]);
    setCurrentPersonId(id);
    return id;
  };

  // ── runner ───────────────────────────────────────────────────────
  // REAL IMPLEMENTATION: POST /api/settings (the status toggle, not the
  // profile-fields PATCH) — server-side re-checks isBlocked before
  // allowing "online", same as the disabled attribute here does
  // client-side. See lib/business — the settings route in the
  // backend-wired app.
  const toggleRunnerStatus = () => {
    if (!currentPerson) return;
    if (currentPerson.status === "offline" && currentPerson.isBlocked) return; // matches server-side guard
    setPeople((prev) => prev.map((p) => (p.id === currentPerson.id ? { ...p, status: p.status === "online" ? "offline" : "online" } : p)));
  };

  // REAL IMPLEMENTATION: PATCH /api/settings — applies the same
  // minimum-viable-profile validation Settings and onboarding both enforce
  // (see lib/business/onboarding.ts::validateRunnerProfile in the
  // backend-wired app) before writing. Not re-implemented here since this
  // build has no server-side validation layer at all — the Settings screen
  // still shows the same disabled-until-valid button client-side.
  const updateRunnerProfile: Store["updateRunnerProfile"] = (fields) => {
    if (!currentPerson) return;
    setPeople((prev) => prev.map((p) => (p.id === currentPerson.id ? { ...p, ...fields } : p)));
  };

  // ── chat creation ────────────────────────────────────────────────
  // REAL IMPLEMENTATION: POST /api/chats — find-or-create, validates
  // runnerId is actually a real `type: 'runner'` person (a real gap found
  // during review: without this check, a crafted id could create a
  // permanently broken chat — see the backend-wired app's
  // app/api/chats/route.ts), and handles the race where two near-
  // simultaneous requests both try to create the same chat.
  const findOrCreateChat: Store["findOrCreateChat"] = (runnerId, prefill) => {
    if (!currentPerson) throw new Error("Not signed in.");
    const existing = Object.values(chats).find((c) => c.runnerId === runnerId && c.ordererId === currentPerson.id);
    if (existing) return existing.id;
    const id = "chat_" + uid();
    setChats((prev) => ({ ...prev, [id]: { id, runnerId, ordererId: currentPerson.id, unreadForRunner: 0, unreadForOrderer: 0, countdownEndsAt: null, lockedUntil: null, prefill: prefill ?? null, messages: [] } }));
    return id;
  };

  // ── request / price / fulfilment lifecycle ──────────────────────
  // REAL IMPLEMENTATION: POST /api/requests. Enforces, server-side: the
  // caller actually owns this chat as its orderer (an ownership check
  // found missing in early review — every write function needs this, not
  // just the ones handling money); a blocked orderer can edit an already-
  // open request but not create a new one; an offline runner can never
  // receive a new request at all (specifically so the countdown never
  // starts against someone who isn't around to respond); and the
  // countdown only starts fresh if nothing is already counting down. See
  // lib/business/requests.ts::submitRequest.
  const submitRequest: Store["submitRequest"] = (chatId, fields) => {
    const chat = chats[chatId];
    if (!chat || !currentPerson) return;
    const runnerPerson = people.find((p) => p.id === chat.runnerId);
    if (runnerPerson?.status === "offline") throw new Error(`${runnerPerson.name} is offline — you can't send a request until they're back online.`);

    const currentRequest = [...chat.messages].reverse().find((m) => m.type === "request");
    const isEditingOpen = currentRequest?.requestStatus === "open";
    const alreadyCounting = chat.countdownEndsAt && chat.countdownEndsAt > Date.now();
    const countdownEndsAt = alreadyCounting ? chat.countdownEndsAt : Date.now() + RESPONSE_WINDOW_MS;

    setChats((prev) => {
      const c = prev[chatId];
      if (!c) return prev; // defensive — chatId is always valid by the time these run, but this keeps the type honest
      let messages: Message[];
      if (isEditingOpen && currentRequest) {
        messages = c.messages.map((m) => (m.id === currentRequest.id ? { ...m, ...fields, note: fields.note ?? "" } : m));
      } else {
        messages = [...c.messages, blankMessage({ chatId, type: "request", sender: "orderer", ...fields, note: fields.note ?? "", requestStatus: "open" })];
      }
      return { ...prev, [chatId]: { ...c, messages, countdownEndsAt } };
    });
  };

  // REAL IMPLEMENTATION: DELETE /api/requests/[id] — verifies the caller
  // owns this chat as its runner. See lib/business/requests.ts::rejectRequest.
  const rejectRequest: Store["rejectRequest"] = (chatId) => {
    const runnerName = currentPerson?.name ?? "The runner";
    setChats((prev) => {
      const c = prev[chatId];
      if (!c) return prev; // defensive — chatId is always valid by the time these run, but this keeps the type honest
      return { ...prev, [chatId]: { ...c, countdownEndsAt: null, messages: [...c.messages, blankMessage({ chatId, type: "system", text: `${runnerName} can't fulfil this request.` })] } };
    });
  };

  // REAL IMPLEMENTATION: POST /api/prices. Verifies the caller owns this
  // chat as its runner (found missing in review — without it, any runner
  // could send a price into any other runner's chat) and that they're not
  // blocked. Snapshots items/note onto the price row — this is why the
  // schema's CHECK constraint had to allow those columns on price rows
  // too, a real mismatch found during review. See
  // lib/business/prices.ts::sendPrice.
  const sendPrice: Store["sendPrice"] = (chatId, price) => {
    const chat = chats[chatId];
    const currentRequest = chat && [...chat.messages].reverse().find((m) => m.type === "request");
    if (!chat || !currentRequest || currentRequest.requestStatus !== "open") return;
    setChats((prev) => {
      const c = prev[chatId];
      if (!c) return prev; // defensive — chatId is always valid by the time these run, but this keeps the type honest
      const priceCard = blankMessage({ chatId, type: "price", sender: "runner", requestId: currentRequest.id, price, items: currentRequest.items, note: currentRequest.note, priceStatus: "pending" });
      const messages = c.messages.map((m) => (m.id === currentRequest.id ? { ...m, requestStatus: "locked" as const } : m));
      return { ...prev, [chatId]: { ...c, countdownEndsAt: null, messages: [...messages, priceCard] } };
    });
  };

  // REAL IMPLEMENTATION: POST /api/prices/[id]/accept. This is the most
  // important function to get right in the real app — see the "payment
  // bypass" note below. Verifies the caller owns this chat as its
  // orderer. Debits the wallet only via a concurrency-safe guard (an
  // unguarded read-then-write here was a real lost-update race found
  // during review). CRITICALLY: a direct (non-wallet) charge must NEVER
  // be confirmed by this route directly — only by the Flutterwave webhook,
  // after it independently verifies payment happened. The version of this
  // function below has no such gate, because there's no payment provider
  // wired up at all yet — it always "succeeds," including for a charge
  // the wallet doesn't cover. That is the single most important thing NOT
  // to carry over verbatim into the real app. See
  // lib/business/prices.ts::acceptPrice and its verifiedExternally flag.
  const acceptPrice: Store["acceptPrice"] = (chatId, priceId) => {
    const chat = chats[chatId];
    const priceCard = chat?.messages.find((m) => m.id === priceId);
    if (!chat || !priceCard || !currentPerson) return;
    const price = priceCard.price ?? 0;
    const useWallet = currentPerson.walletBalance >= price;
    const fulfilmentCode = String(1000 + Math.floor(Math.random() * 8999));

    if (useWallet) {
      setPeople((prev) => prev.map((p) => (p.id === currentPerson.id ? { ...p, walletBalance: p.walletBalance - price } : p)));
    }
    setChats((prev) => {
      const c = prev[chatId];
      if (!c) return prev; // defensive — chatId is always valid by the time these run, but this keeps the type honest
      const messages = c.messages.map((m) => (m.id === priceId ? { ...m, priceStatus: "confirmed" as const, confirmedAt: Date.now(), fulfilmentCode, paidVia: (useWallet ? "wallet" : "direct") as "wallet" | "direct" } : m));
      return { ...prev, [chatId]: { ...c, messages } };
    });
  };

  // REAL IMPLEMENTATION: POST /api/prices/[id]/reject — ownership-checked
  // the same way. See lib/business/prices.ts::rejectPrice.
  const rejectPrice: Store["rejectPrice"] = (chatId, priceId) => {
    setChats((prev) => {
      const c = prev[chatId];
      if (!c) return prev; // defensive — chatId is always valid by the time these run, but this keeps the type honest
      const priceCard = c.messages.find((m) => m.id === priceId);
      const messages = c.messages.map((m) => {
        if (m.id === priceId) return { ...m, priceStatus: "rejected" as const };
        if (priceCard && m.id === priceCard.requestId) return { ...m, requestStatus: "open" as const };
        return m;
      });
      return { ...prev, [chatId]: { ...c, messages: [...messages, blankMessage({ chatId, type: "system", text: "Price rejected — request is open again." })] } };
    });
  };

  // REAL IMPLEMENTATION: POST /api/prices/[id]/cancel — same ownership
  // check, this time against the runner. See lib/business/prices.ts::cancelPrice.
  const cancelPrice: Store["cancelPrice"] = (chatId, priceId) => {
    setChats((prev) => {
      const c = prev[chatId];
      if (!c) return prev; // defensive — chatId is always valid by the time these run, but this keeps the type honest
      const priceCard = c.messages.find((m) => m.id === priceId);
      const messages = c.messages.map((m) => {
        if (m.id === priceId) return { ...m, priceStatus: "cancelled_runner" as const };
        if (priceCard && m.id === priceCard.requestId) return { ...m, requestStatus: "open" as const };
        return m;
      });
      return { ...prev, [chatId]: { ...c, messages: [...messages, blankMessage({ chatId, type: "system", text: "Price cancelled by runner — request is open again." })] } };
    });
  };

  // REAL IMPLEMENTATION: POST /api/fulfilment/[priceId]/submit-code.
  // Verifies the caller owns this chat as its runner. Deliberately allowed
  // even for a runner who's since been blocked — blocking stops new
  // business, not work already paid for and in motion. See
  // lib/business/fulfilment.ts::submitFulfilmentCode.
  const submitFulfilmentCode: Store["submitFulfilmentCode"] = (chatId, priceId, code) => {
    const chat = chats[chatId];
    const priceCard = chat?.messages.find((m) => m.id === priceId);
    if (!priceCard) return false;
    const matched = code.trim() === priceCard.fulfilmentCode;
    setChats((prev) => {
      const c = prev[chatId];
      if (!c) return prev; // defensive — chatId is always valid by the time these run, but this keeps the type honest
      const messages = c.messages.map((m) => (m.id === priceId ? { ...m, codeEnteredByRunner: code.trim(), priceStatus: matched ? ("fulfilled" as const) : m.priceStatus } : m));
      return { ...prev, [chatId]: { ...c, messages: matched ? [...messages, blankMessage({ chatId, type: "system", text: "Order fulfilled — code confirmed on delivery." })] : messages } };
    });
    return matched;
  };

  // REAL IMPLEMENTATION: POST /api/messages. Deliberately routed through
  // an API route in the real app rather than direct-to-Supabase, same as
  // every other write — see the backend-wired app's
  // docs/backend-stack-decisions.md for why plain chat text is NOT an
  // exception to that rule (the chat-lock check below is exactly the
  // reason: simple here, awkward to express as an RLS policy). Verifies
  // the caller is actually a participant in this chat (found missing in
  // review). See lib/business/messaging.ts::sendChatMessage.
  const sendChatMessage: Store["sendChatMessage"] = (chatId, text) => {
    if (!currentPerson) return;
    const chat = chats[chatId];
    if (!chat) return;
    if (chat.lockedUntil && chat.lockedUntil > Date.now()) return;
    const sender = currentPerson.type === "runner" ? "runner" : "orderer";
    setChats((prev) => {
      const c = prev[chatId];
      if (!c) return prev; // defensive — chatId is always valid by the time these run, but this keeps the type honest
      return {
        ...prev,
        [chatId]: {
          ...c,
          unreadForRunner: sender === "orderer" ? c.unreadForRunner + 1 : c.unreadForRunner,
          unreadForOrderer: sender === "runner" ? c.unreadForOrderer + 1 : c.unreadForOrderer,
          messages: [...c.messages, blankMessage({ chatId, type: "text", sender, text })],
        },
      };
    });
  };

  // ── orderer extras ───────────────────────────────────────────────
  // REAL IMPLEMENTATION: POST /api/starred — self-scoped (always the
  // caller's own array), no ownership check needed beyond "are you signed
  // in as an orderer."
  const toggleStar: Store["toggleStar"] = (runnerId) => {
    if (!currentPerson) return;
    setPeople((prev) => prev.map((p) => (p.id === currentPerson.id ? { ...p, starredRunnerIds: p.starredRunnerIds.includes(runnerId) ? p.starredRunnerIds.filter((id) => id !== runnerId) : [...p.starredRunnerIds, runnerId] } : p)));
  };

  // REAL IMPLEMENTATION: POST /api/wallet/top-up. Verifies the Flutterwave
  // transaction server-side before crediting anything — never trusts a
  // client-supplied amount alone. Uses an atomic Postgres increment
  // function, not a read-then-write — a plain read-then-write here has a
  // lost-update race under concurrent top-ups (found during review; see
  // the migration's increment_wallet_balance comment in the backend-wired
  // app). This mock version has neither concern, since there's no real
  // money and no concurrency.
  const topUpWallet: Store["topUpWallet"] = (amount) => {
    if (!currentPerson) return;
    setPeople((prev) => prev.map((p) => (p.id === currentPerson.id ? { ...p, walletBalance: p.walletBalance + amount } : p)));
  };

  // ── trust & moderation ────────────────────────────────────────────
  // REAL IMPLEMENTATION: POST /api/reports. Verifies the reporter is
  // actually a participant in chatId, and that reportedId is the OTHER
  // participant — not an arbitrary id the client could otherwise supply
  // (a real gap found during review). See
  // lib/business/moderation.ts::fileReport.
  const fileReport: Store["fileReport"] = (chatId, reportedId, message) => {
    if (!currentPerson) return;
    setAdminReports((prev) => [...prev, { id: uid(), reporterId: currentPerson.id, reportedId, chatId, message, status: "open", at: Date.now() }]);
  };

  // REAL IMPLEMENTATION: POST /api/feedback. Separate from reporting on
  // purpose — feedback is about the app, not a person, and follows a
  // review workflow rather than a moderation one.
  const submitFeedback: Store["submitFeedback"] = (message) => {
    if (!currentPerson) return;
    setAppFeedback((prev) => [...prev, { id: uid(), userId: currentPerson.id, message, status: "new", at: Date.now() }]);
  };

  // ── admin ─────────────────────────────────────────────────────────
  // REAL IMPLEMENTATION: PATCH /api/reports/[id] — admin-only route.
  const resolveReport: Store["resolveReport"] = (reportId, status) => {
    setAdminReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
  };

  // REAL IMPLEMENTATION: POST /api/moderation/block or /unblock.
  // Deliberately does NOT trust a caller-supplied personType for the
  // "force runner offline" branch — reads it from the person's own record
  // instead (a real bug found during review: trusting the parameter meant
  // a caller passing the wrong type could silently skip forcing a runner
  // offline). Also verifies a reportId being actioned is actually a report
  // against the person being blocked, not just any id (found during the
  // same review pass). See lib/business/moderation.ts::setPersonBlocked
  // and resolveReportIfAgainst.
  const setPersonBlocked: Store["setPersonBlocked"] = (personId, blocked, reportId) => {
    const person = people.find((p) => p.id === personId);
    if (!person) return;
    setPeople((prev) => prev.map((p) => (p.id === personId ? { ...p, isBlocked: blocked, status: blocked && p.type === "runner" ? "offline" : p.status } : p)));
    if (blocked) {
      setAdminReports((prev) => prev.map((r) => (r.reportedId === personId && r.status === "open" ? { ...r, status: "actioned" } : r)));
      if (reportId) {
        const report = adminReports.find((r) => r.id === reportId);
        if (report && report.reportedId === personId) resolveReport(reportId, "actioned");
      }
    }
    const message = blocked
      ? person.type === "runner"
        ? "Your account has been blocked following a report against you and you've been taken offline. Contact admin if you think this is a mistake."
        : "Your account has been blocked following a report against you. Contact admin if you think this is a mistake."
      : "Your account has been unblocked. You're free to use Runna as normal again.";
    sendAdminMessage(personId, message);
  };

  // REAL IMPLEMENTATION: PATCH /api/feedback — admin-only.
  const markFeedbackReviewed: Store["markFeedbackReviewed"] = (feedbackId) => {
    setAppFeedback((prev) => prev.map((f) => (f.id === feedbackId ? { ...f, status: "reviewed" } : f)));
  };

  // REAL IMPLEMENTATION: POST /api/admin/messages (admin) and
  // POST /api/admin-chat (the person replying) both call the equivalent of
  // this — see lib/business/messaging.ts::sendAdminChatMessage and
  // sendAutomatedMessage. unreadForUser/unreadForAdmin track both
  // directions so neither an automated notice nor a reply goes unnoticed
  // (a real UI gap found during review — the Support row had no unread
  // indicator at all for a while).
  const sendAdminMessage: Store["sendAdminMessage"] = (personId, text) => {
    setAdminChats((prev) => {
      const existing = Object.values(prev).find((c) => c.personId === personId);
      const msg = { id: uid(), sender: "admin" as const, text, at: Date.now() };
      if (existing) return { ...prev, [existing.id]: { ...existing, unreadForUser: existing.unreadForUser + 1, messages: [...existing.messages, msg] } };
      const id = "admin_chat_" + uid();
      return { ...prev, [id]: { id, personId, unreadForUser: 1, unreadForAdmin: 0, messages: [msg] } };
    });
  };

  const markAdminChatRead: Store["markAdminChatRead"] = (adminChatId, by) => {
    setAdminChats((prev) => {
      const c = prev[adminChatId];
      if (!c) return prev;
      return { ...prev, [adminChatId]: { ...c, [by === "user" ? "unreadForUser" : "unreadForAdmin"]: 0 } };
    });
  };

  // ── admin: campus/vendor/destination CRUD ───────────────────────
  // REAL IMPLEMENTATION: POST/PATCH /api/admin/campuses,
  // /api/admin/vendors, /api/admin/destinations — admin-only routes.
  // Deactivation is always a soft-delete (isActive: false), never a real
  // delete, so any order that already referenced a vendor or destination
  // still resolves correctly. See lib/business — the admin routes in the
  // backend-wired app.
  const addCampus: Store["addCampus"] = (name) => {
    setCampuses((prev) => [...prev, { id: "campus_" + uid(), name, isActive: true }]);
  };
  const toggleCampusActive: Store["toggleCampusActive"] = (id) => {
    setCampuses((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };
  const addVendor: Store["addVendor"] = (campusId, name) => {
    setVendors((prev) => [...prev, { id: "vendor_" + uid(), campusId, name, isActive: true }]);
  };
  const toggleVendorActive: Store["toggleVendorActive"] = (id) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v)));
  };
  const addDestination: Store["addDestination"] = (campusId, name) => {
    setDestinations((prev) => [...prev, { id: "destination_" + uid(), campusId, name, isActive: true }]);
  };
  const toggleDestinationActive: Store["toggleDestinationActive"] = (id) => {
    setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)));
  };

  const value = useMemo<Store>(
    () => ({
      currentPersonId, currentPerson, signInAs, signOut,
      people, chats, adminReports, appFeedback, adminChats, campuses, vendors, destinations, now,
      finishRunnerOnboarding, finishOrdererOnboarding,
      toggleRunnerStatus, updateRunnerProfile,
      findOrCreateChat, submitRequest, rejectRequest, sendPrice, acceptPrice, rejectPrice, cancelPrice, submitFulfilmentCode, sendChatMessage,
      toggleStar, topUpWallet,
      fileReport, submitFeedback,
      resolveReport, setPersonBlocked, markFeedbackReviewed, sendAdminMessage, markAdminChatRead,
      addCampus, toggleCampusActive, addVendor, toggleVendorActive, addDestination, toggleDestinationActive,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPersonId, people, chats, adminReports, appFeedback, adminChats, campuses, vendors, destinations, now]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

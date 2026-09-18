// Mock data, ported directly from the prototype's MOCK_RUNNERS,
// MOCK_ORDERERS, VENDORS, DESTINATIONS and seedChats() — same names, same
// relationships, same seeded conversations, so anyone who tested the
// original prototype will recognise this data immediately.
//
// This file is the ONE thing that changes when this becomes the real,
// backend-wired app: everything below gets replaced by real Supabase
// tables (see the backend-wired app's supabase/migrations/0001_init.sql
// and supabase/seed.sql for the schema this data maps onto 1:1).
import type { Campus, Vendor, Destination, Person, Chat, Message } from "@/types/mock";

export const CAMPUSES: Campus[] = [
  { id: "abuad", name: "Afe Babalola University", isActive: true },
  { id: "ui", name: "University of Ibadan", isActive: true },
];

export const VENDORS: Vendor[] = [
  { id: "v1", campusId: "abuad", name: "Cafe One", isActive: true },
  { id: "v2", campusId: "abuad", name: "Cafe Two", isActive: true },
  { id: "v3", campusId: "abuad", name: "Jabi 1", isActive: true },
  { id: "v4", campusId: "abuad", name: "Bites and Eats", isActive: true },
  { id: "v5", campusId: "abuad", name: "Mr Spicy", isActive: true },
  { id: "v6", campusId: "abuad", name: "Goodies", isActive: true },
  { id: "v7", campusId: "abuad", name: "Chops Corner", isActive: true },
  { id: "v8", campusId: "abuad", name: "Smoothie Bar", isActive: true },
  { id: "v9", campusId: "ui", name: "Mama Put Junction", isActive: true },
  { id: "v10", campusId: "ui", name: "Bukka Express", isActive: true },
];

export const DESTINATIONS: Destination[] = [
  { id: "d1", campusId: "abuad", name: "Female Hostel 1", isActive: true },
  { id: "d2", campusId: "abuad", name: "Female Hostel 2", isActive: true },
  { id: "d3", campusId: "abuad", name: "Male Hostel 1", isActive: true },
  { id: "d4", campusId: "abuad", name: "Male Hostel 2", isActive: true },
  { id: "d5", campusId: "abuad", name: "Bayo Lawal Street", isActive: true },
  { id: "d6", campusId: "ui", name: "Queens Hall", isActive: true },
  { id: "d7", campusId: "ui", name: "Independence Hall", isActive: true },
];

function runner(p: Omit<Person, "type" | "starredRunnerIds" | "walletBalance">): Person {
  return { ...p, type: "runner", starredRunnerIds: [], walletBalance: 0 };
}

export const MOCK_RUNNERS: Person[] = [
  runner({
    id: "r1", code: "205671", name: "Kemi Adisa", campusId: "abuad", status: "online",
    vendorIds: ["v1", "v3"], destinationIds: ["d1", "d2"],
    canDeliver: true, canPickup: true, deliverTo: ["room", "front"],
    payoutAccount: "Flutterwave — GTB •••• 4471", isBlocked: false,
    selfVendorName: null, selfVendorLocation: null,
  }),
  runner({
    id: "r2", code: "118823", name: "Chidi Okafor", campusId: "abuad", status: "offline",
    vendorIds: ["v4", "v5"], destinationIds: ["d3"],
    canDeliver: true, canPickup: false, deliverTo: ["front"],
    payoutAccount: "Flutterwave — Access •••• 2290", isBlocked: false,
    selfVendorName: null, selfVendorLocation: null,
  }),
  runner({
    id: "r3", code: "337290", name: "Ada Nwosu", campusId: "abuad", status: "online",
    vendorIds: ["v6", "v8"], destinationIds: ["d1", "d4"],
    canDeliver: false, canPickup: true, deliverTo: [],
    payoutAccount: "Flutterwave — Zenith •••• 8810", isBlocked: false,
    selfVendorName: null, selfVendorLocation: null,
  }),
  runner({
    id: "r4", code: "556210", name: "Tobi Balogun", campusId: "abuad", status: "offline",
    vendorIds: ["v7", "v2"], destinationIds: ["d5"],
    canDeliver: true, canPickup: true, deliverTo: ["room"],
    payoutAccount: "Flutterwave — UBA •••• 6603", isBlocked: false,
    selfVendorName: null, selfVendorLocation: null,
  }),
  runner({
    id: "r5", code: "902147", name: "Femi Adeyemi", campusId: "abuad", status: "online",
    vendorIds: ["v2", "v6"], destinationIds: ["d2", "d3"],
    canDeliver: true, canPickup: true, deliverTo: ["front"],
    payoutAccount: "Flutterwave — GTB •••• 1129", isBlocked: false,
    selfVendorName: "Femi's Grill", selfVendorLocation: "Room B204, Male Hostel 1",
  }),
];

function orderer(id: string, code: string, name: string, extra?: Partial<Person>): Person {
  return {
    id, code, name, type: "orderer", campusId: "abuad",
    vendorIds: [], destinationIds: [], canDeliver: false, canPickup: false, deliverTo: [],
    status: "offline", isBlocked: false, payoutAccount: null, selfVendorName: null, selfVendorLocation: null,
    starredRunnerIds: [], walletBalance: 0,
    ...extra,
  };
}

export const MOCK_ORDERERS: Person[] = [
  orderer("o1", "552013", "Tolu Bankole", { starredRunnerIds: ["r1", "r5"], walletBalance: 2000 }),
  orderer("o2", "890144", "Bisi Fashola"),
  orderer("o3", "220091", "Emeka Uche"),
  orderer("o4", "771002", "Ngozi Eze"),
  orderer("o5", "410358", "Zainab Yusuf"),
  orderer("o6", "663017", "Adaeze Obi"),
];

export const MOCK_ADMIN: Person = {
  id: "adm1", type: "admin", code: "000000", name: "Admin (Ope)", campusId: null,
  vendorIds: [], destinationIds: [], canDeliver: false, canPickup: false, deliverTo: [],
  status: "offline", isBlocked: false, payoutAccount: null, selfVendorName: null, selfVendorLocation: null,
  starredRunnerIds: [], walletBalance: 0,
};

let uidCounter = 0;
export function uid() {
  uidCounter += 1;
  return `m_${Date.now()}_${uidCounter}`;
}

function textMsg(chatId: string, sender: "runner" | "orderer", text: string, at: number): Message {
  return { id: uid(), chatId, type: "text", sender, text, at, vendorId: null, destinationId: null, fulfilmentType: null, items: null, deliveryTime: null, note: null, requestStatus: null, requestId: null, price: null, priceStatus: null, confirmedAt: null, fulfilmentCode: null, codeEnteredByRunner: null, paidVia: null, adminNotifiedAt: null };
}
function systemMsg(chatId: string, text: string, at: number): Message {
  return { id: uid(), chatId, type: "system", sender: null, text, at, vendorId: null, destinationId: null, fulfilmentType: null, items: null, deliveryTime: null, note: null, requestStatus: null, requestId: null, price: null, priceStatus: null, confirmedAt: null, fulfilmentCode: null, codeEnteredByRunner: null, paidVia: null, adminNotifiedAt: null };
}
interface RequestOpts { chatId: string; vendorId: string; destinationId: string; fulfilmentType: import("@/types/mock").FulfilmentType; items: string; deliveryTime: string; note?: string; status: import("@/types/mock").RequestStatus; at: number }
function requestMsg(o: RequestOpts): Message {
  return { id: uid(), chatId: o.chatId, type: "request", sender: "orderer", text: null, at: o.at, vendorId: o.vendorId, destinationId: o.destinationId, fulfilmentType: o.fulfilmentType, items: o.items, deliveryTime: o.deliveryTime, note: o.note ?? "", requestStatus: o.status, requestId: null, price: null, priceStatus: null, confirmedAt: null, fulfilmentCode: null, codeEnteredByRunner: null, paidVia: null, adminNotifiedAt: null };
}
interface PriceOpts { chatId: string; requestId: string; price: number; items?: string; note?: string; status: import("@/types/mock").PriceStatus; confirmedAt?: number; fulfilmentCode?: string; codeEnteredByRunner?: string; at: number }
function priceMsgFn(o: PriceOpts): Message {
  return { id: uid(), chatId: o.chatId, type: "price", sender: "runner", text: null, at: o.at, vendorId: null, destinationId: null, fulfilmentType: null, items: o.items ?? "", deliveryTime: null, note: o.note ?? "", requestStatus: null, requestId: o.requestId, price: o.price, priceStatus: o.status, confirmedAt: o.confirmedAt ?? null, fulfilmentCode: o.fulfilmentCode ?? null, codeEnteredByRunner: o.codeEnteredByRunner ?? null, paidVia: null, adminNotifiedAt: null };
}

// Same seeded conversations as the prototype's seedChats(): a
// rejected-then-accepted negotiation, a confirmed order awaiting handoff, a
// fully completed order, another confirmed-and-pending-delivery order, a
// chat that timed out and is now locked, a live countdown still ticking, a
// second runner's completed order, and a third runner's pickup order.
export function seedChats(): Record<string, Chat> {
  const chats: Record<string, Chat> = {};
  const min = 60 * 1000, hr = 60 * min, day = 24 * hr, now = Date.now();

  const c1 = "chat_tolu_kemi";
  const req1 = requestMsg({ chatId: c1, vendorId: "v1", destinationId: "d1", fulfilmentType: "delivery-room", items: "Jollof rice and a bottle of Fanta", deliveryTime: "20:00", note: "Room 14, Female Hostel 1. I'll be around all evening", status: "locked", at: now - 9 * min });
  const price1a = priceMsgFn({ chatId: c1, requestId: req1.id, price: 3500, items: req1.items ?? "", note: req1.note ?? "", status: "rejected", at: now - 8 * min });
  const price1b = priceMsgFn({ chatId: c1, requestId: req1.id, price: 3200, items: req1.items ?? "", note: req1.note ?? "", status: "pending", at: now - 6 * min });
  chats[c1] = { id: c1, runnerId: "r1", ordererId: "o1", unreadForRunner: 1, unreadForOrderer: 0, countdownEndsAt: null, lockedUntil: null, prefill: null, messages: [req1, textMsg(c1, "runner", "Sure, on it now — let me check the price", now - 8 * min + 10000), price1a, textMsg(c1, "orderer", "That's a bit much for just rice and a drink — can you do 3000?", now - 7 * min), price1b, textMsg(c1, "orderer", "Deal, sending payment now", now - 3 * min - 20000)] };

  const c2 = "chat_bisi_kemi";
  const req2 = requestMsg({ chatId: c2, vendorId: "v1", destinationId: "d1", fulfilmentType: "delivery-room", items: "Suya — 3 sticks, extra pepper", deliveryTime: "12:30", note: "3 sticks, extra pepper please", status: "locked", at: now - 62 * min });
  const price2 = priceMsgFn({ chatId: c2, requestId: req2.id, price: 3200, items: req2.items ?? "", note: req2.note ?? "", status: "confirmed", confirmedAt: now - 40 * min, fulfilmentCode: "4821", at: now - 45 * min });
  chats[c2] = { id: c2, runnerId: "r1", ordererId: "o2", unreadForRunner: 0, unreadForOrderer: 0, countdownEndsAt: null, lockedUntil: null, prefill: null, messages: [textMsg(c2, "orderer", "Good morning, I want to order suya from Cafe One please", now - 70 * min), textMsg(c2, "runner", "Morning! What quantity, and any extra spice?", now - 65 * min), req2, price2, textMsg(c2, "orderer", "Paid! On my way to class but I'll be back by 12", now - 39 * min), textMsg(c2, "runner", "No wahala, I'll hold it till you're back", now - 38 * min)] };

  const c3 = "chat_emeka_kemi";
  const req3 = requestMsg({ chatId: c3, vendorId: "v3", destinationId: "d2", fulfilmentType: "delivery-room", items: "2x jollof rice and chicken", deliveryTime: "19:30", note: "Please deliver hot, thank you!", status: "locked", at: now - 26 * hr + 3 * min });
  const price3 = priceMsgFn({ chatId: c3, requestId: req3.id, price: 5500, items: req3.items ?? "", note: req3.note ?? "", status: "fulfilled", confirmedAt: now - 26 * hr + 5 * min, fulfilmentCode: "9014", codeEnteredByRunner: "9014", at: now - 26 * hr + 4 * min });
  chats[c3] = { id: c3, runnerId: "r1", ordererId: "o3", unreadForRunner: 0, unreadForOrderer: 0, countdownEndsAt: null, lockedUntil: null, prefill: null, messages: [textMsg(c3, "orderer", "Hi Kemi, are you free to run an order this evening?", now - 26 * hr), textMsg(c3, "runner", "Okay boss, send the details", now - 26 * hr + 2 * min), req3, price3, textMsg(c3, "orderer", "Paid already, see you by 7", now - 25 * hr - 50 * min), systemMsg(c3, "Order fulfilled — code confirmed on delivery.", now - 25 * hr), textMsg(c3, "orderer", "Got it, thank you so much!", now - 25 * hr + 2 * min), textMsg(c3, "runner", "You're welcome, enjoy!", now - 25 * hr + 3 * min)] };

  const c5 = "chat_zainab_kemi";
  const req5 = requestMsg({ chatId: c5, vendorId: "v1", destinationId: "d2", fulfilmentType: "delivery-front", items: "2 sausage rolls and a smoothie", deliveryTime: "17:00", note: "Please leave with the porter if I'm not there", status: "locked", at: now - 5 * hr + 4 * min });
  const price5 = priceMsgFn({ chatId: c5, requestId: req5.id, price: 2600, items: req5.items ?? "", note: req5.note ?? "", status: "confirmed", confirmedAt: now - 4 * hr, fulfilmentCode: "7350", at: now - 4 * hr - 5 * min });
  chats[c5] = { id: c5, runnerId: "r1", ordererId: "o5", unreadForRunner: 0, unreadForOrderer: 0, countdownEndsAt: null, lockedUntil: null, prefill: null, messages: [textMsg(c5, "orderer", "Hi, please can I get something from Cafe One?", now - 5 * hr), textMsg(c5, "runner", "Sure! Delivery or pickup?", now - 5 * hr + 2 * min), req5, price5, textMsg(c5, "orderer", "Just paid, thank you!", now - 4 * hr + 1 * min), textMsg(c5, "runner", "Got it, on my way shortly", now - 4 * hr + 2 * min)] };

  const c4 = "chat_ngozi_kemi";
  const req4 = requestMsg({ chatId: c4, vendorId: "v1", destinationId: "d1", fulfilmentType: "delivery-room", items: "2 smoothies", deliveryTime: "14:00", note: "It's for my roommate's birthday, kind of urgent", status: "open", at: now - hr - 5 * min });
  chats[c4] = { id: c4, runnerId: "r1", ordererId: "o4", unreadForRunner: 0, unreadForOrderer: 0, countdownEndsAt: null, lockedUntil: now + 23 * hr, prefill: null, messages: [req4, systemMsg(c4, "This chat is locked because there was no response within 5 minutes. It will reopen in 24 hours.", now - hr)] };

  const c8 = "chat_adaeze_kemi";
  const req8 = requestMsg({ chatId: c8, vendorId: "v3", destinationId: "on_location", fulfilmentType: "pickup", items: "Small chicken and chips", deliveryTime: "13:00", status: "open", at: now - 90000 });
  chats[c8] = { id: c8, runnerId: "r1", ordererId: "o6", unreadForRunner: 1, unreadForOrderer: 0, countdownEndsAt: now + 3 * min + 30000, lockedUntil: null, prefill: null, messages: [req8] };

  const c6 = "chat_tolu_chidi";
  const req6 = requestMsg({ chatId: c6, vendorId: "v4", destinationId: "d3", fulfilmentType: "delivery-front", items: "Meat pie and zobo", deliveryTime: "18:00", status: "locked", at: now - 2 * day + 3 * min });
  const price6 = priceMsgFn({ chatId: c6, requestId: req6.id, price: 2800, items: req6.items ?? "", note: req6.note ?? "", status: "fulfilled", confirmedAt: now - 2 * day + 6 * min, fulfilmentCode: "3307", codeEnteredByRunner: "3307", at: now - 2 * day + 5 * min });
  chats[c6] = { id: c6, runnerId: "r2", ordererId: "o1", unreadForRunner: 0, unreadForOrderer: 0, countdownEndsAt: null, lockedUntil: null, prefill: null, messages: [textMsg(c6, "orderer", "Hi Chidi, can I get meat pie and zobo from Bites and Eats?", now - 2 * day), textMsg(c6, "runner", "Yes ma, gimme 2 mins to confirm price", now - 2 * day + 2 * min), req6, price6, textMsg(c6, "orderer", "Paid! I'll be at the hostel gate by 6", now - 2 * day + 7 * min), systemMsg(c6, "Order fulfilled — code confirmed on delivery.", now - 2 * day + 8 * min), textMsg(c6, "orderer", "Thanks for being quick as usual", now - 2 * day + 9 * min), textMsg(c6, "runner", "Anytime! Message me whenever", now - 2 * day + 10 * min)] };

  const c7 = "chat_tolu_ada";
  const req7 = requestMsg({ chatId: c7, vendorId: "v8", destinationId: "on_location", fulfilmentType: "pickup", items: "Large mango smoothie", deliveryTime: "17:30", status: "locked", at: now - 22 * hr + 4 * min });
  const price7 = priceMsgFn({ chatId: c7, requestId: req7.id, price: 1500, items: req7.items ?? "", note: req7.note ?? "", status: "confirmed", confirmedAt: now - 21 * hr, fulfilmentCode: "6142", at: now - 21 * hr - 5 * min });
  chats[c7] = { id: c7, runnerId: "r3", ordererId: "o1", unreadForRunner: 0, unreadForOrderer: 0, countdownEndsAt: null, lockedUntil: null, prefill: null, messages: [textMsg(c7, "orderer", "Do you have smoothies in stock? Want a large mango one", now - 22 * hr), textMsg(c7, "runner", "Yes! It's pickup only though, can you come to Smoothie Bar?", now - 22 * hr + 3 * min), req7, price7, textMsg(c7, "orderer", "Paid, heading there now", now - 21 * hr + 2 * min), textMsg(c7, "runner", "See you soon", now - 21 * hr + 3 * min)] };

  return chats;
}

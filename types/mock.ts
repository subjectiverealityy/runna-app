// Simplified types for the frontend-only build — no Database/Supabase
// generics, since nothing here is queried from a real table. Shapes match
// what the real app's types/database.ts will use, so porting a screen from
// here into the backend-wired app later is a data-source swap, not a
// rewrite.

export type PersonType = "runner" | "customer" | "admin";
export type RunnerStatus = "online" | "offline";
export type MessageType = "text" | "system" | "request" | "price";
export type RequestStatus = "open" | "locked";
export type PriceStatus = "pending" | "confirmed" | "rejected" | "cancelled_runner" | "fulfilled";
export type PaidVia = "wallet" | "direct";
export type ReportStatus = "open" | "dismissed" | "actioned";
export type FeedbackStatus = "new" | "reviewed";
export type FulfilmentType = "delivery-room" | "delivery-entrance" | "pickup";
export type DeliverTo = "room" | "entrance";

export interface Campus {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Vendor {
  id: string;
  campusId: string;
  name: string;
  isActive: boolean;
}

export interface Destination {
  id: string;
  campusId: string;
  name: string;
  isActive: boolean;
}

export interface Person {
  id: string;
  type: PersonType;
  code: string;
  name: string;
  campusId: string | null;

  // runner-only
  vendorIds: string[];
  destinationIds: string[];
  canDeliver: boolean;
  canPickup: boolean;
  deliverTo: DeliverTo[];
  status: RunnerStatus;
  isBlocked: boolean;
  payoutAccount: string | null;
  selfVendorName: string | null;
  selfVendorLocation: string | null;

  // customer-only
  starredRunnerIds: string[];
  walletBalance: number;
}

export interface Message {
  id: string;
  chatId: string;
  type: MessageType;
  sender: "runner" | "customer" | "admin" | null;
  text: string | null;
  at: number;

  // request fields
  vendorId: string | null;
  destinationId: string | null;
  fulfilmentType: FulfilmentType | null;
  items: string | null;
  deliveryTime: string | null;
  note: string | null;
  requestStatus: RequestStatus | null;

  // price fields
  requestId: string | null;
  price: number | null;
  priceStatus: PriceStatus | null;
  confirmedAt: number | null;
  fulfilmentCode: string | null;
  codeEnteredByRunner: string | null;
  paidVia: PaidVia | null;
  adminNotifiedAt: number | null;
}

export interface Chat {
  id: string;
  runnerId: string;
  customerId: string;
  unreadForRunner: number;
  unreadForCustomer: number;
  countdownEndsAt: number | null;
  lockedUntil: number | null;
  prefill: { vendorId?: string; destinationId?: string; fulfilmentType?: FulfilmentType } | null;
  messages: Message[];
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  chatId: string | null;
  message: string;
  status: ReportStatus;
  at: number;
}

export interface Feedback {
  id: string;
  userId: string;
  message: string;
  status: FeedbackStatus;
  at: number;
}

export interface AdminMessage {
  id: string;
  sender: "admin" | "user";
  text: string;
  at: number;
}

export interface AdminChat {
  id: string;
  personId: string;
  unreadForUser: number;
  unreadForAdmin: number;
  messages: AdminMessage[];
}

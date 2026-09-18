"use client";
import { X, Info } from "lucide-react";

const runnerTips = [
  "Send a price on an open request to lock it in — the customer's already set the vendor, items, time and destination.",
  "Reply within 5 minutes or the whole chat locks for 24 hours, not just that request.",
  "Payment lands in your account (or straight off their wallet) the instant they confirm — no need to front the cost.",
  "At handoff, get the customer to read out their code and enter it here — that's what marks the order delivered.",
  "One order at a time per chat — reject or wait for the current one to finish before you can send another price.",
  "Reports can get you blocked, and missing 3 requests in 30 minutes takes you offline automatically.",
];

const customerTips = [
  "Tap + to build a request — pick the vendor, destination, what you want and when — that's what the runner prices.",
  "They'll send back a price. Pay to confirm it, or reject it to ask for something different.",
  "No response in 5 minutes locks the whole chat for 24 hours — nothing's charged, but you'll need to wait it out.",
  "One order at a time per chat — you can send a new request once the current one's delivered.",
  "At handoff, read your runner the code shown on your paid order — that's how they confirm it's really you.",
  "An offline runner can't be sent a request — message them first to ask when they'll be back.",
];

export function InfoModal({ role, onClose }: { role: "runner" | "customer"; onClose: () => void }) {
  const tips = role === "runner" ? runnerTips : customerTips;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl p-5 max-h-[80%] overflow-y-auto bg-paper">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-base text-navy">{role === "runner" ? "For runners" : "How ordering works"}</span>
          <button onClick={onClose}>
            <X size={20} className="text-sub" />
          </button>
        </div>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 bg-amber text-navyDeep">
                {i + 1}
              </span>
              <p className="text-sm text-ink">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-1">
      <Info size={16} color="#B9C0D1" />
    </button>
  );
}

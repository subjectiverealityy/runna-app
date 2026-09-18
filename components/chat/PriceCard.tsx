"use client";
import { Check, AlertCircle, Quote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeChip } from "@/components/ui/CodeChip";
import type { Message, PriceStatus } from "@/types/mock";

interface Props {
  price: Message;
  viewer: "runner" | "orderer";
  walletBalance: number;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onSubmitCode?: (code: string) => void;
  codeDraft: string;
  onCodeDraftChange: (v: string) => void;
  codeError?: boolean;
}

const statusMeta: Record<PriceStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: "Awaiting response", bg: "#FDF1DC", fg: "#C9821A" },
  rejected: { label: "Rejected", bg: "#FBEAE8", fg: "#B8463C" },
  cancelled_runner: { label: "Cancelled by runner", bg: "#FBEAE8", fg: "#B8463C" },
  confirmed: { label: "Paid — not yet delivered", bg: "#E7F3EC", fg: "#2E8B63" },
  fulfilled: { label: "Delivered & confirmed", bg: "#E7F3EC", fg: "#2E8B63" },
};

function formatMoney(n: number) {
  return "\u20a6" + Number(n || 0).toLocaleString("en-NG");
}

// Runner-authored — price only. Confirmation and payment happen here.
export function PriceCard({ price, viewer, walletBalance, onAccept, onReject, onCancel, onSubmitCode, codeDraft, onCodeDraftChange, codeError }: Props) {
  const meta = statusMeta[price.priceStatus ?? "pending"];
  const terminal = price.priceStatus === "rejected" || price.priceStatus === "cancelled_runner";

  return (
    <div className="rounded-xl overflow-hidden max-w-[86%] border border-line bg-card" style={{ opacity: terminal ? 0.6 : 1 }}>
      <div className="px-3.5 pt-3 pb-2.5 bg-navy">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#C7CEDD]">Price</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.fg }}>
            {meta.label}
          </span>
        </div>
        <div className="text-white font-mono font-semibold text-lg mt-1">{formatMoney(Number(price.price))}</div>
      </div>

      {(price.items || price.note) && (
        <div className="px-3.5 pt-3 space-y-1.5">
          {price.items && (
            <div className="text-xs text-ink">
              <span className="font-semibold">Items: </span>
              {price.items}
            </div>
          )}
          {price.note && (
            <div className="flex gap-1.5 text-xs italic text-sub">
              <Quote size={12} className="mt-0.5 flex-shrink-0" />
              <span>{price.note}</span>
            </div>
          )}
        </div>
      )}

      {price.priceStatus === "pending" && viewer === "orderer" && (
        <div className="px-3.5 py-3 space-y-2">
          <Button onClick={onAccept}>{walletBalance >= Number(price.price) ? `Pay ${formatMoney(Number(price.price))} from wallet` : `Pay ${formatMoney(Number(price.price))} to confirm`}</Button>
          <Button tone="ghost" onClick={onReject}>
            Reject — ask for a different price
          </Button>
        </div>
      )}
      {price.priceStatus === "pending" && viewer === "runner" && (
        <div className="px-3.5 py-3">
          <button onClick={onCancel} className="text-xs font-semibold text-red">
            Cancel this price
          </button>
        </div>
      )}

      {price.priceStatus === "confirmed" && viewer === "orderer" && (
        <div className="px-3.5 py-3 space-y-2">
          {price.paidVia === "wallet" && <p className="text-[11px] text-green">Paid from your wallet</p>}
          <div className="rounded-lg px-3 py-2 flex items-center justify-between bg-paper">
            <span className="text-[11px] text-sub">Show this to your runner</span>
            <CodeChip>{price.fulfilmentCode}</CodeChip>
          </div>
        </div>
      )}
      {price.priceStatus === "confirmed" && viewer === "runner" && (
        <div className="px-3.5 py-3 space-y-2">
          <span className="text-[11px] text-sub">Ask the orderer to read out their code, then enter it here to confirm handoff</span>
          <div className="flex gap-2">
            <input
              value={codeDraft}
              onChange={(e) => onCodeDraftChange(e.target.value)}
              placeholder="0000"
              maxLength={4}
              className="flex-1 font-mono text-sm rounded-lg px-3 py-2 border border-line outline-none"
            />
            <button onClick={() => onSubmitCode?.(codeDraft)} className="rounded-lg px-3 py-2 font-semibold text-sm bg-green text-white">
              Confirm
            </button>
          </div>
          {codeError && (
            <div className="flex items-center gap-1 text-xs text-red">
              <AlertCircle size={12} /> Code doesn't match — check with the orderer.
            </div>
          )}
        </div>
      )}

      {price.priceStatus === "fulfilled" && (
        <div className="px-3.5 py-3 flex items-center gap-1.5 text-xs font-medium text-green">
          <Check size={14} /> Handoff confirmed
        </div>
      )}
    </div>
  );
}

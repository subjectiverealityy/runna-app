"use client";
import { MapPin, Clock, Quote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/types/mock";

interface Props {
  request: Message;
  vendorName: string;
  destinationName: string;
  fulfilmentLabel: string;
  viewer: "runner" | "orderer";
  chatLocked: boolean;
  onEdit?: () => void;
  onSendPrice?: () => void;
}

// Orderer-authored, editable until a runner locks it by sending a price.
export function RequestCard({ request, vendorName, destinationName, fulfilmentLabel, viewer, chatLocked, onEdit, onSendPrice }: Props) {
  const statusMeta =
    request.requestStatus === "locked"
      ? { label: "Locked — priced", bg: "#E7F3EC", fg: "#2E8B63" }
      : { label: "Open for a price", bg: "#FDF1DC", fg: "#C9821A" };

  return (
    <div className="rounded-xl overflow-hidden max-w-[86%] border border-line bg-card">
      <div className="px-3.5 pt-3 pb-2.5 bg-navyDeep">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#B9C0D1]">Request</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: statusMeta.bg, color: statusMeta.fg }}>
            {statusMeta.label}
          </span>
        </div>
        <div className="text-white font-semibold text-sm mt-1">{vendorName}</div>
      </div>

      <div className="px-3.5 py-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-ink">
          <MapPin size={13} className="text-sub" />
          {destinationName} · {fulfilmentLabel}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ink">
          <Clock size={13} className="text-sub" />
          {request.deliveryTime}
        </div>
        <div className="text-xs text-ink">
          <span className="font-semibold">Items: </span>
          {request.items}
        </div>
        {request.note && (
          <div className="flex gap-1.5 text-xs italic pt-1 border-t border-line text-sub">
            <Quote size={12} className="mt-0.5 flex-shrink-0" />
            <span>{request.note}</span>
          </div>
        )}
      </div>

      {!chatLocked && request.requestStatus === "open" && viewer === "orderer" && (
        <div className="px-3.5 pb-3">
          <Button tone="ghost" onClick={onEdit}>
            Edit request
          </Button>
        </div>
      )}
      {!chatLocked && request.requestStatus === "open" && viewer === "runner" && (
        <div className="px-3.5 pb-3 space-y-2">
          <Button onClick={onSendPrice}>Send a price</Button>
        </div>
      )}
      {request.requestStatus === "locked" && viewer === "orderer" && (
        <div className="px-3.5 pb-3">
          <p className="text-[11px] text-faint">Locked to the price card below</p>
        </div>
      )}
    </div>
  );
}

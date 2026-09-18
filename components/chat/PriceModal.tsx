"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PriceModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (price: number) => void }) {
  const [price, setPrice] = useState("");
  const canSubmit = price && Number(price) > 0;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="w-full rounded-t-2xl p-5 bg-paper">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-base text-navy">Send a price</span>
          <button onClick={onClose}>
            <X size={20} className="text-sub" />
          </button>
        </div>
        <label className="text-xs font-semibold text-sub">Price (₦)</label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="3200"
          autoFocus
          className="w-full mt-1.5 mb-5 rounded-xl px-3.5 py-3 text-sm border border-line outline-none font-mono"
        />
        <Button disabled={!canSubmit} onClick={() => onSubmit(Number(price))}>
          Send price
        </Button>
      </div>
    </div>
  );
}

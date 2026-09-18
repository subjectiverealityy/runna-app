"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ReportModal({ otherName, onClose, onSubmit }: { otherName: string; onClose: () => void; onSubmit: (message: string) => void }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    onSubmit(message.trim());
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md mx-auto rounded-t-2xl p-5 bg-paper">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-base text-navy">Report {otherName}</span>
          <button onClick={onClose}>
            <X size={20} className="text-sub" />
          </button>
        </div>
        {sent ? (
          <p className="text-sm text-sub">
            Sent — this is private. {otherName} won't be notified, and admin will follow up if action is needed.
          </p>
        ) : (
          <>
            <p className="text-xs mb-3 text-sub">Tell us what happened. This goes straight to admin, privately.</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="What went wrong?"
              className="w-full rounded-xl px-3.5 py-3 text-sm border border-line outline-none mb-4"
            />
            <Button tone="red" disabled={!message.trim()} onClick={submit}>
              Submit report
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
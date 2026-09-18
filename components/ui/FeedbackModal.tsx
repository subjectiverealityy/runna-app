"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { useMockStore } from "@/lib/mock/store";

// REAL IMPLEMENTATION: POST /api/feedback. Here it just appends to the
// mock store's appFeedback array — see lib/mock/store.tsx::submitFeedback.
export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const { submitFeedback } = useMockStore();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl p-5 bg-paper">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-base text-navy">Send feedback</span>
          <button onClick={onClose}>
            <X size={20} className="text-sub" />
          </button>
        </div>
        {sent ? (
          <p className="text-sm text-sub">Thanks — this goes straight to our team.</p>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bugs, ideas, anything about the app itself…"
              rows={4}
              className="w-full rounded-xl px-3.5 py-3 text-sm border border-line outline-none mb-4"
            />
            <Button
              disabled={!message.trim()}
              onClick={() => {
                submitFeedback(message.trim());
                setSent(true);
              }}
            >
              Send
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

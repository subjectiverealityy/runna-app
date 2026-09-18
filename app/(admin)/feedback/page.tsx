"use client";
import { useMockStore } from "@/lib/mock/store";

export default function FeedbackPage() {
  const { appFeedback, people, markFeedbackReviewed } = useMockStore();
  const withUsers = appFeedback.map((f) => ({ ...f, user: people.find((p) => p.id === f.userId) }));
  const fresh = withUsers.filter((f) => f.status === "new");
  const reviewed = withUsers.filter((f) => f.status !== "new");

  return (
    <div className="px-4 py-4 space-y-2.5 overflow-y-auto h-full">
      {appFeedback.length === 0 && <p className="text-xs text-center pt-10 text-faint">No feedback yet.</p>}
      {fresh.map((f) => (
        <div key={f.id} className="rounded-xl p-3.5 border border-line bg-card">
          <p className="text-sm font-semibold text-navy">
            {f.user?.name} <span className="text-xs font-normal text-faint">({f.user?.type})</span>
          </p>
          <p className="text-xs mt-1 text-ink">{f.message}</p>
          <button onClick={() => markFeedbackReviewed(f.id)} className="text-xs font-semibold mt-2 text-green">Mark reviewed</button>
        </div>
      ))}
      {reviewed.length > 0 && (
        <>
          <p className="text-xs font-semibold pt-2 text-faint">Reviewed</p>
          {reviewed.map((f) => (
            <div key={f.id} className="rounded-xl p-3.5 border border-line bg-card opacity-60">
              <p className="text-sm font-semibold text-navy">{f.user?.name}</p>
              <p className="text-xs mt-1 text-ink">{f.message}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

"use client";
import { useMockStore } from "@/lib/mock/store";
import type { Report } from "@/types/mock";

function reportTitle(r: Report, reporter: string, reported: string) {
  const when = new Date(r.at).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  return `${reporter} reported ${reported} — ${when}`;
}

// REAL IMPLEMENTATION: PATCH /api/reports/[id] (dismiss) and POST
// /api/moderation/block (block, which also closes out the report — a real
// bug found during review had this only happen when blocking from the
// Reports tab, not from the admin chat screen; both now go through the
// same setPersonBlocked function). See lib/business/moderation.ts.
export default function ReportsPage() {
  const { adminReports, people, resolveReport, setPersonBlocked } = useMockStore();

  const withNames = adminReports.map((r) => ({
    ...r,
    reporter: people.find((p) => p.id === r.reporterId),
    reported: people.find((p) => p.id === r.reportedId),
  }));
  const open = withNames.filter((r) => r.status === "open");
  const resolved = withNames.filter((r) => r.status !== "open");

  return (
    <div className="px-4 py-4 space-y-2.5 overflow-y-auto h-full">
      {adminReports.length === 0 && <p className="text-xs text-center pt-10 text-faint">No reports yet.</p>}
      {open.map((r) => (
        <div key={r.id} className="rounded-xl p-3.5 border border-line bg-card">
          <p className="text-sm font-semibold text-navy">
            {reportTitle(r, `${r.reporter?.name} #${r.reporter?.code} (${r.reporter?.type})`, `${r.reported?.name} #${r.reported?.code} (${r.reported?.type})`)}
          </p>
          <p className="text-xs mt-1 text-ink">{r.message}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => r.reported && setPersonBlocked(r.reported.id, true, r.id)} className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-red text-white">
              Block {r.reported?.name}
            </button>
            <button onClick={() => resolveReport(r.id, "dismissed")} className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-line text-sub">
              Dismiss
            </button>
          </div>
        </div>
      ))}
      {resolved.length > 0 && (
        <>
          <p className="text-xs font-semibold pt-2 text-faint">Resolved</p>
          {resolved.map((r) => (
            <div key={r.id} className="rounded-xl p-3.5 border border-line bg-card opacity-60">
              <p className="text-sm font-semibold text-navy">{r.reporter?.name} reported {r.reported?.name}</p>
              <p className="text-xs mt-1 text-ink">{r.message}</p>
              <span className="text-[10px] font-semibold text-faint">{r.status}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

// REAL IMPLEMENTATION: fetches active campuses from Supabase directly (a
// read, so no API route needed — see the write/read routing rule in
// docs/backend-stack-decisions.md). Here it reads the mock store's
// campuses state, seeded from lib/mock/data.ts and mutable via admin's
// Data tab (lib/mock/store.tsx::addCampus/toggleCampusActive).
export default function CampusPage() {
  const router = useRouter();
  const { campuses } = useMockStore();

  const pick = (campusId: string) => {
    sessionStorage.setItem("onboarding_campus", campusId);
    const role = sessionStorage.getItem("onboarding_role");
    router.push(role === "runner" ? "/runner-setup" : "/customer-setup");
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-10">
      <h2 className="text-xl font-bold mb-1 text-navy">Select your campus</h2>
      <p className="text-sm mb-6 text-sub">This determines the vendors and hostels you'll see.</p>
      <div className="space-y-2.5">
        {campuses.filter((c) => c.isActive).map((c) => (
          <button key={c.id} onClick={() => pick(c.id)} className="w-full flex items-center justify-between rounded-xl px-4 py-4 border border-line bg-card">
            <span className="font-medium text-sm text-ink">{c.name}</span>
            <ChevronRight size={16} className="text-faint" />
          </button>
        ))}
      </div>
    </div>
  );
}

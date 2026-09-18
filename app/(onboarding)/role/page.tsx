"use client";
import { useRouter } from "next/navigation";

// REAL IMPLEMENTATION: identical UI — this page has no backend dependency
// even in the real app, it just stores the pick in sessionStorage for the
// next onboarding step. See the backend-wired app's
// app/(onboarding)/role/page.tsx (same file, unchanged).
export default function RolePage() {
  const router = useRouter();

  const pick = (role: "runner" | "customer") => {
    sessionStorage.setItem("onboarding_role", role);
    router.push("/campus");
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6">
      <h2 className="text-xl font-bold text-center mb-1 text-navy">What are you here as?</h2>
      <p className="text-center text-sm mb-8 text-sub">You can't switch this later, so pick the one that fits.</p>
      <div className="space-y-3">
        <button onClick={() => pick("customer")} className="w-full rounded-2xl p-5 text-left border-2 border-amber bg-amber/10 active:scale-[0.98]">
          <span className="font-semibold text-base text-navy">Customer</span>
          <p className="text-xs mt-1 text-sub">Order items in advance to skip waiting lines, or get them delivered to your location</p>
        </button>
        <button onClick={() => pick("runner")} className="w-full rounded-2xl p-5 text-left border-2 border-amber bg-amber/10 active:scale-[0.98]">
          <span className="font-semibold text-base text-navy">Runner or Runner-Vendor</span>
          <p className="text-xs mt-1 text-sub">Fulfil orders for other vendor's customers, or fulfil orders for your business and start earning</p>
        </button>
      </div>
    </div>
  );
}

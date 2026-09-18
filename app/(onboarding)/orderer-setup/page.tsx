"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useMockStore } from "@/lib/mock/store";

// REAL IMPLEMENTATION: POST /api/onboarding/orderer — see
// lib/business/onboarding.ts::createOrdererProfile in the backend-wired
// app. Here it calls the mock store's finishOrdererOnboarding, which does
// the same thing as an in-memory push instead of a database insert.
export default function OrdererSetupPage() {
  const router = useRouter();
  const { finishOrdererOnboarding } = useMockStore();
  const [name, setName] = useState("");

  const finish = () => {
    const campusId = sessionStorage.getItem("onboarding_campus") ?? "abuad";
    finishOrdererOnboarding({ name, campusId });
    router.push("/search");
  };

  return (
    <div className="flex-1 flex flex-col px-5 pt-10">
      <p className="text-xs font-semibold text-sub">Your client code will be assigned once you finish setup.</p>
      <label className="text-xs font-semibold text-sub mt-8">What's your name?</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Tolu"
        className="w-full mt-1.5 mb-8 rounded-xl px-3.5 py-3 text-sm border border-line bg-card outline-none"
      />
      <div className="flex-1" />
      <div className="pb-6">
        <Button disabled={!name.trim()} onClick={finish}>
          Finish setup
        </Button>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMockStore } from "@/lib/mock/store";
import { CheckRow } from "@/components/ui/CheckRow";
import { Button } from "@/components/ui/Button";
import type { DeliverTo } from "@/types/mock";

// REAL IMPLEMENTATION: POST /api/onboarding/runner. Validates the same
// minimum-viable-profile rule server-side before inserting — see
// lib/business/onboarding.ts::validateRunnerProfile in the backend-wired
// app. That validation is duplicated here client-side (the canSubmit
// checks below) since there's no server to enforce it in this build; when
// wiring up the backend, keep both — client-side for instant feedback,
// server-side because the client can never be trusted alone.
export default function RunnerSetupPage() {
  const router = useRouter();
  const { finishRunnerOnboarding, vendors: allVendors, destinations: allDestinations } = useMockStore();
  const campusId = typeof window !== "undefined" ? sessionStorage.getItem("onboarding_campus") ?? "abuad" : "abuad";
  const vendors = allVendors.filter((v) => v.campusId === campusId && v.isActive);
  const destinations = allDestinations.filter((d) => d.campusId === campusId && d.isActive);

  const [name, setName] = useState("");
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [destinationIds, setDestinationIds] = useState<string[]>([]);
  const [canDeliver, setCanDeliver] = useState(false);
  const [canPickup, setCanPickup] = useState(false);
  const [deliverTo, setDeliverTo] = useState<DeliverTo[]>([]);
  const [selfVendorOn, setSelfVendorOn] = useState(false);
  const [selfVendorName, setSelfVendorName] = useState("");
  const [selfVendorLocation, setSelfVendorLocation] = useState("");
  const [payoutLinked, setPayoutLinked] = useState(false);

  const toggleIn = <T,>(list: T[], setList: (v: T[]) => void, id: T) => setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const selfVendorValid = !selfVendorOn || Boolean(selfVendorName.trim() && selfVendorLocation.trim());
  const hasVendorSource = vendorIds.length > 0 || (selfVendorOn && Boolean(selfVendorName.trim()));
  const hasDestinationIfNeeded = !canDeliver || destinationIds.length > 0;
  const canSubmit = name.trim() && hasVendorSource && selfVendorValid && hasDestinationIfNeeded && (canDeliver || canPickup) && payoutLinked;

  const finish = () => {
    finishRunnerOnboarding({
      name, campusId, vendorIds, destinationIds, canDeliver, canPickup, deliverTo,
      selfVendorName: selfVendorOn ? selfVendorName.trim() : undefined,
      selfVendorLocation: selfVendorOn ? selfVendorLocation.trim() : undefined,
    });
    router.push("/orders");
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 pt-8 pb-4 space-y-6">
      <label className="text-xs font-semibold text-sub">What's your name?</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full mt-1.5 rounded-xl px-3.5 py-3 text-sm border border-line bg-card outline-none" />

      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Select the vendors you can take orders for</p>
        <div className="grid grid-cols-2 gap-2">
          {vendors.map((v) => (
            <CheckRow key={v.id} label={v.name} checked={vendorIds.includes(v.id)} onToggle={() => toggleIn(vendorIds, setVendorIds, v.id)} />
          ))}
        </div>
        <div className="mt-2">
          <CheckRow label="I fulfil orders for my own business" checked={selfVendorOn} onToggle={() => setSelfVendorOn(!selfVendorOn)} />
        </div>
        {selfVendorOn && (
          <div className="mt-2 space-y-2">
            <p className="text-[11px] text-sub">Add your business as a vendor, and add where your customers will pick up orders.</p>
            <input value={selfVendorName} onChange={(e) => setSelfVendorName(e.target.value)} placeholder="Business name — e.g. Femi's Grill" className="w-full rounded-xl px-3.5 py-3 text-sm border border-line bg-card outline-none" />
            <input value={selfVendorLocation} onChange={(e) => setSelfVendorLocation(e.target.value)} placeholder="Fulfilment location — e.g. Room C103, Female Hostel 4" className="w-full rounded-xl px-3.5 py-3 text-sm border border-line bg-card outline-none" />
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Select the hostels you can deliver to</p>
        <div className="space-y-2">
          {destinations.map((d) => (
            <CheckRow key={d.id} label={d.name} checked={destinationIds.includes(d.id)} onToggle={() => toggleIn(destinationIds, setDestinationIds, d.id)} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Select the fulfilment methods you offer</p>
        <div className="space-y-2">
          <CheckRow label="Delivery" checked={canDeliver} onToggle={() => setCanDeliver(!canDeliver)} />
          {canDeliver && (
            <div className="pl-4 space-y-2">
              <CheckRow label="To hostel rooms" checked={deliverTo.includes("room")} onToggle={() => toggleIn(deliverTo, setDeliverTo, "room")} />
              <CheckRow label="To hostel entrances" checked={deliverTo.includes("front")} onToggle={() => toggleIn(deliverTo, setDeliverTo, "front")} />
            </div>
          )}
          <CheckRow label="Pickup" checked={canPickup} onToggle={() => setCanPickup(!canPickup)} />
        </div>
      </div>

      <div className="rounded-xl p-3.5 text-xs leading-relaxed bg-amber/10 border border-amber text-amberDeep">
        <span className="font-semibold">Important: </span>
        You'll only be visible on the marketplace once you switch your status to 'Online'.
      </div>

      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Payout account</p>
        <button
          onClick={() => setPayoutLinked(true)}
          className="w-full flex items-center justify-between rounded-xl px-3.5 py-3 border"
          style={{ borderColor: payoutLinked ? "#2E8B63" : "#E4E0D3", background: payoutLinked ? "#E7F3EC" : "#F9F7F1" }}
        >
          <span className="text-sm font-medium text-ink">{payoutLinked ? "Flutterwave linked" : "Connect with Flutterwave"}</span>
        </button>
      </div>

      <Button disabled={!canSubmit} onClick={finish}>
        Finish setup
      </Button>
    </div>
  );
}

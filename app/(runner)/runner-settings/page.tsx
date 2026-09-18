"use client";
import { useEffect, useState } from "react";
import { CheckRow } from "@/components/ui/CheckRow";
import { Button } from "@/components/ui/Button";
import { CodeChip } from "@/components/ui/CodeChip";
import { FeedbackModal } from "@/components/ui/FeedbackModal";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { useMockStore } from "@/lib/mock/store";
import type { DeliverTo } from "@/types/mock";

// REAL IMPLEMENTATION: PATCH /api/settings, applying the SAME
// validateRunnerProfile rule onboarding uses — this was a real gap found
// during review (Settings originally had none at all, letting a runner
// save a profile with zero vendors and zero fulfilment methods). Both the
// client-side canSave check below and a server-side check are needed in
// the real app; the client-side one alone (which is all this build has)
// is never sufficient on its own.
export default function RunnerSettingsPage() {
  const { currentPerson, updateRunnerProfile, vendors: allVendors, destinations: allDestinations } = useMockStore();
  const [name, setName] = useState("");
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [destinationIds, setDestinationIds] = useState<string[]>([]);
  const [canDeliver, setCanDeliver] = useState(false);
  const [canPickup, setCanPickup] = useState(false);
  const [deliverTo, setDeliverTo] = useState<DeliverTo[]>([]);
  const [selfVendorOn, setSelfVendorOn] = useState(false);
  const [selfVendorName, setSelfVendorName] = useState("");
  const [selfVendorLocation, setSelfVendorLocation] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!currentPerson) return;
    setName(currentPerson.name);
    setVendorIds(currentPerson.vendorIds);
    setDestinationIds(currentPerson.destinationIds);
    setCanDeliver(currentPerson.canDeliver);
    setCanPickup(currentPerson.canPickup);
    setDeliverTo(currentPerson.deliverTo);
    setSelfVendorOn(Boolean(currentPerson.selfVendorName));
    setSelfVendorName(currentPerson.selfVendorName ?? "");
    setSelfVendorLocation(currentPerson.selfVendorLocation ?? "");
  }, [currentPerson]);

  if (!currentPerson) return null;
  const vendors = allVendors.filter((v) => v.campusId === currentPerson.campusId && v.isActive);
  const destinations = allDestinations.filter((d) => d.campusId === currentPerson.campusId && d.isActive);

  const toggleIn = <T,>(list: T[], setList: (v: T[]) => void, id: T) => setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const selfVendorValid = !selfVendorOn || Boolean(selfVendorName.trim() && selfVendorLocation.trim());
  const hasVendorSource = vendorIds.length > 0 || (selfVendorOn && Boolean(selfVendorName.trim()));
  const hasDestinationIfNeeded = !canDeliver || destinationIds.length > 0;
  const canSave = hasVendorSource && selfVendorValid && hasDestinationIfNeeded && (canDeliver || canPickup);

  const save = () => {
    updateRunnerProfile({
      name, vendorIds, destinationIds, canDeliver, canPickup, deliverTo,
      selfVendorName: selfVendorOn ? selfVendorName.trim() : null,
      selfVendorLocation: selfVendorOn ? selfVendorLocation.trim() : null,
    });
  };

  return (
    <div className="px-5 py-5 space-y-6 overflow-y-auto h-full">
      <div>
        <label className="text-xs font-semibold text-sub">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={save} className="w-full mt-1.5 rounded-xl px-3.5 py-3 text-sm border border-line bg-card outline-none" />
      </div>
      <div>
        <p className="text-xs font-semibold text-sub">Your code</p>
        <div className="mt-1.5"><CodeChip>#{currentPerson.code}</CodeChip></div>
      </div>
      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Vendors you take orders for</p>
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
            <p className="text-[11px] text-sub">Add your business as a vendor, and where customers should find you to pick up.</p>
            <input value={selfVendorName} onChange={(e) => setSelfVendorName(e.target.value)} placeholder="Business name — e.g. Femi's Grill" className="w-full rounded-xl px-3.5 py-3 text-sm border border-line bg-card outline-none" />
            <input value={selfVendorLocation} onChange={(e) => setSelfVendorLocation(e.target.value)} placeholder="Fulfilment location — e.g. Room C103, Female Hostel 4" className="w-full rounded-xl px-3.5 py-3 text-sm border border-line bg-card outline-none" />
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Hostels you deliver to</p>
        <div className="space-y-2">
          {destinations.map((d) => (
            <CheckRow key={d.id} label={d.name} checked={destinationIds.includes(d.id)} onToggle={() => toggleIn(destinationIds, setDestinationIds, d.id)} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Fulfilment methods</p>
        <div className="space-y-2">
          <CheckRow label="Delivery" checked={canDeliver} onToggle={() => setCanDeliver(!canDeliver)} />
          {canDeliver && (
            <div className="pl-4 space-y-2">
              <CheckRow label="To hostel room" checked={deliverTo.includes("room")} onToggle={() => toggleIn(deliverTo, setDeliverTo, "room")} />
              <CheckRow label="To hostel entrance" checked={deliverTo.includes("entrance")} onToggle={() => toggleIn(deliverTo, setDeliverTo, "entrance")} />
            </div>
          )}
          <CheckRow label="Pickup" checked={canPickup} onToggle={() => setCanPickup(!canPickup)} />
        </div>
      </div>
      {!canSave && (
        <p className="text-[11px] text-red">
          Pick at least one vendor (or set up your own business), at least one fulfilment method, and a hostel to
          deliver to if delivery's one of them — before saving.
        </p>
      )}
      <Button tone="navy" disabled={!canSave} onClick={save}>
        Save changes
      </Button>
      <button onClick={() => setShowFeedback(true)} className="text-xs font-semibold text-sub underline">
        Send feedback
      </button>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      <div className="pt-2 border-t border-line">
        <SignOutButton />
      </div>
    </div>
  );
}

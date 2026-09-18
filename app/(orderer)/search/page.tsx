"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { InfoModal } from "@/components/ui/InfoModal";
import { useMockStore } from "@/lib/mock/store";
import type { Person, FulfilmentType } from "@/types/mock";

// REAL IMPLEMENTATION: a Supabase read against people_public (never the
// base people table — it holds wallet_balance and payout_account, and
// letting every authenticated user read every row directly was a real
// privacy gap found during review; see docs/backend-stack-decisions.md's
// hardening notes). Here it just filters the in-memory people array.
export default function SearchPage() {
  const router = useRouter();
  const { currentPerson, people, toggleStar, findOrCreateChat, vendors: allVendors, destinations: allDestinations } = useMockStore();
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [vendorFilter, setVendorFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [fulfilmentFilter, setFulfilmentFilter] = useState<FulfilmentType | "">("");

  if (!currentPerson) return null;
  const vendors = allVendors.filter((v) => v.campusId === currentPerson.campusId && v.isActive);
  const destinations = allDestinations.filter((d) => d.campusId === currentPerson.campusId && d.isActive);
  const runners = people.filter((p) => p.type === "runner" && p.campusId === currentPerson.campusId);

  const supportsFulfilment = (r: Person, type: FulfilmentType | "") => {
    if (!type) return true;
    if (type === "pickup") return r.canPickup;
    if (type === "delivery-room") return r.canDeliver && r.deliverTo.includes("room");
    if (type === "delivery-front") return r.canDeliver && r.deliverTo.includes("front");
    return true;
  };

  const vendorSummary = (r: Person) => {
    const names = r.vendorIds.map((id) => vendors.find((v) => v.id === id)?.name).filter(Boolean) as string[];
    if (r.selfVendorName) names.push(r.selfVendorName);
    return names.join(", ") || "—";
  };
  const destinationSummary = (r: Person) => {
    const names = r.destinationIds.map((id) => destinations.find((d) => d.id === id)?.name).filter(Boolean) as string[];
    return names.join(", ") || "—";
  };
  const methodsSummary = (r: Person) => {
    const methods: string[] = [];
    if (r.canDeliver && r.deliverTo.includes("room")) methods.push("Delivery (room)");
    if (r.canDeliver && r.deliverTo.includes("front")) methods.push("Delivery (hostel front)");
    if (r.canPickup) methods.push("Pickup");
    return methods.join(", ") || "—";
  };

  const results = runners
    .filter((r) => (showStarredOnly ? currentPerson.starredRunnerIds.includes(r.id) : true))
    .filter((r) => (vendorFilter ? r.vendorIds.includes(vendorFilter) : true))
    .filter((r) => (destinationFilter ? r.destinationIds.includes(destinationFilter) : true))
    .filter((r) => supportsFulfilment(r, fulfilmentFilter))
    .sort((a, b) => (a.status === b.status ? 0 : a.status === "online" ? -1 : 1));

  const message = (runnerId: string) => {
    const chatId = findOrCreateChat(runnerId, {
      vendorId: vendorFilter || undefined,
      destinationId: destinationFilter || undefined,
      fulfilmentType: (fulfilmentFilter || undefined) as FulfilmentType | undefined,
    });
    router.push(`/orderer-messages/${chatId}`);
  };

  return (
    <div className="px-4 py-4 space-y-3 overflow-y-auto h-full">
      <div className="flex gap-2">
        <button onClick={() => setShowStarredOnly(false)} className={`flex-1 rounded-lg py-2 text-xs font-semibold border border-line ${!showStarredOnly ? "bg-navy text-white" : "bg-card text-sub"}`}>All runners</button>
        <button onClick={() => setShowStarredOnly(true)} className={`flex-1 rounded-lg py-2 text-xs font-semibold border border-line ${showStarredOnly ? "bg-navy text-white" : "bg-card text-sub"}`}>Starred</button>
      </div>
      <div className="flex gap-2">
        <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} className="flex-1 rounded-lg px-2.5 py-2 text-xs border border-line bg-card">
          <option value="">Any vendor</option>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <select value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)} className="flex-1 rounded-lg px-2.5 py-2 text-xs border border-line bg-card">
          <option value="">Any destination</option>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <select value={fulfilmentFilter} onChange={(e) => setFulfilmentFilter(e.target.value as FulfilmentType)} className="w-full rounded-lg px-2.5 py-2 text-xs border border-line bg-card">
        <option value="">Any fulfilment method</option>
        <option value="delivery-room">Delivery to room</option>
        <option value="delivery-front">Delivery to hostel front</option>
        <option value="pickup">Pickup</option>
      </select>

      <div className="space-y-2.5">
        {results.length === 0 && <p className="text-xs text-center pt-10 text-faint">No runners match yet.</p>}
        {results.map((r) => (
          <div key={r.id} className="rounded-xl p-3.5 border border-line bg-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-navy">{r.name}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${r.status === "online" ? "bg-green" : "bg-faint"}`} />
                  <span className="text-[10px] text-sub">{r.status === "online" ? "Online" : "Offline"}</span>
                </div>
                <span className="font-mono text-xs text-faint">#{r.code}</span>
              </div>
              <button onClick={() => toggleStar(r.id)} className="p-1.5 rounded-lg bg-paper">
                <Star size={15} className={currentPerson.starredRunnerIds.includes(r.id) ? "text-amber fill-amber" : "text-faint"} />
              </button>
            </div>
            <div className="mt-2.5 space-y-0.5 text-[11px] text-sub">
              <p><span className="font-semibold">Vendors:</span> {vendorSummary(r)}</p>
              <p><span className="font-semibold">Delivers to:</span> {destinationSummary(r)}</p>
              <p><span className="font-semibold">Fulfilment:</span> {methodsSummary(r)}</p>
            </div>
            <div className="mt-3">
              <button onClick={() => message(r.id)} className="w-full rounded-xl py-3 px-4 font-semibold text-sm bg-navy text-white">Message</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

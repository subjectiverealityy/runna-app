"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Vendor, Destination, Message, FulfilmentType, Person } from "@/types/mock";

interface Props {
  runner: Person;
  vendors: Vendor[];
  destinations: Destination[];
  seed?: Partial<Message> | null;
  isEdit: boolean;
  onClose: () => void;
  onSubmit: (fields: {
    vendorId: string;
    destinationId: string;
    fulfilmentType: FulfilmentType;
    items: string;
    deliveryTime: string;
    note?: string;
  }) => void;
}

const ON_LOCATION = "on_location";

// Options are built from THIS runner's supported vendors/destinations/
// fulfilment types — an orderer can never request something the runner
// doesn't actually offer.
export function RequestModal({ runner, vendors, destinations, seed, isEdit, onClose, onSubmit }: Props) {
  const hasSelfVendor = Boolean(runner.selfVendorName);
  const [vendorId, setVendorId] = useState(seed?.vendorId ?? vendors[0]?.id ?? (hasSelfVendor ? runner.selfVendorName! : ""));

  const options: { value: FulfilmentType; label: string }[] = [];
  if (runner.canDeliver) {
    if (runner.deliverTo.includes("room")) options.push({ value: "delivery-room", label: "Delivery to hostel room" });
    if (runner.deliverTo.includes("entrance")) options.push({ value: "delivery-entrance", label: "Delivery to hostel entrance" });
  }
  if (runner.canPickup) options.push({ value: "pickup", label: "Pickup" });

  const [fulfilmentType, setFulfilmentType] = useState<FulfilmentType>((seed?.fulfilmentType as FulfilmentType) ?? options[0]?.value ?? "pickup");

  const pickupDestination = () =>
    hasSelfVendor && vendorId === runner.selfVendorName && runner.selfVendorLocation ? runner.selfVendorLocation : ON_LOCATION;

  const [destinationId, setDestinationId] = useState(seed?.destinationId ?? (fulfilmentType === "pickup" ? pickupDestination() : destinations[0]?.id ?? ""));
  const [items, setItems] = useState(seed?.items ?? "");
  const [deliveryTime, setDeliveryTime] = useState(seed?.deliveryTime ?? "");
  const [note, setNote] = useState(seed?.note ?? "");

  const isPickupSentinel = (val: string) => val === ON_LOCATION || (hasSelfVendor && val === runner.selfVendorLocation);

  const handleVendorChange = (val: string) => {
    setVendorId(val);
    if (fulfilmentType === "pickup") {
      setDestinationId(val === runner.selfVendorName && runner.selfVendorLocation ? runner.selfVendorLocation : ON_LOCATION);
    }
  };

  const handleFulfilmentChange = (val: FulfilmentType) => {
    setFulfilmentType(val);
    if (val === "pickup") setDestinationId(pickupDestination());
    else if (isPickupSentinel(destinationId)) setDestinationId(destinations[0]?.id ?? "");
  };

  const handleDestinationChange = (val: string) => {
    setDestinationId(val);
    if (!isPickupSentinel(val) && fulfilmentType === "pickup") {
      const deliveryOpt = options.find((o) => o.value.startsWith("delivery"));
      if (deliveryOpt) setFulfilmentType(deliveryOpt.value);
    }
  };

  const canSubmit = vendorId && destinationId && fulfilmentType && items.trim() && deliveryTime.trim();

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md mx-auto rounded-t-2xl p-5 max-h-[88%] overflow-y-auto bg-paper">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-base text-navy">{isEdit ? "Edit request" : "Request an order"}</span>
          <button onClick={onClose}>
            <X size={20} className="text-sub" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-sub">Vendor</label>
            <select value={vendorId} onChange={(e) => handleVendorChange(e.target.value)} className="w-full mt-1.5 rounded-xl px-3.5 py-3 text-sm border border-line outline-none">
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
              {hasSelfVendor && <option value={runner.selfVendorName!}>{runner.selfVendorName}</option>}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-sub">Destination</label>
            <select value={destinationId} onChange={(e) => handleDestinationChange(e.target.value)} className="w-full mt-1.5 rounded-xl px-3.5 py-3 text-sm border border-line outline-none">
              {fulfilmentType === "pickup" &&
                (vendorId === runner.selfVendorName ? (
                  <option value={runner.selfVendorLocation!}>{runner.selfVendorLocation}</option>
                ) : (
                  <option value={ON_LOCATION}>On location</option>
                ))}
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-sub">Fulfilment</label>
            <select value={fulfilmentType} onChange={(e) => handleFulfilmentChange(e.target.value as FulfilmentType)} className="w-full mt-1.5 rounded-xl px-3.5 py-3 text-sm border border-line outline-none">
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-sub">What do you want?</label>
            <input value={items} onChange={(e) => setItems(e.target.value)} placeholder="2x jollof rice and chicken" className="w-full mt-1.5 rounded-xl px-3.5 py-3 text-sm border border-line outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-sub">Delivery time</label>
            <input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="w-full mt-1.5 rounded-xl px-3.5 py-3 text-sm border border-line outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-sub">Note for the runner (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Room 14, please knock twice" className="w-full mt-1.5 rounded-xl px-3.5 py-3 text-sm border border-line outline-none" />
          </div>
        </div>

        <div className="pt-5">
          <Button disabled={!canSubmit} onClick={() => onSubmit({ vendorId, destinationId, fulfilmentType, items: items.trim(), deliveryTime, note: note.trim() })}>
            {isEdit ? "Save request" : "Send request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
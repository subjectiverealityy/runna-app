import type { FulfilmentType } from "@/types/mock";

export function fulfilmentLabel(type: FulfilmentType | null) {
  if (type === "delivery-room") return "Delivery to hostel room";
  if (type === "delivery-entrance") return "Delivery to hostel entrance";
  if (type === "pickup") return "Pickup";
  return "";
}

// deliveryTime is stored as a 24h "HH:MM" string — display it the way the
// prototype did, as 12h with AM/PM, everywhere it's shown to a person.
export function formatTime12h(time: string | null | undefined) {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${period}`;
}
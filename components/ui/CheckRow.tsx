import { clsx } from "clsx";
import { Check } from "lucide-react";

export function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left",
        checked ? "border-navy bg-navy/5" : "border-line bg-card"
      )}
    >
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className={clsx("w-5 h-5 rounded-md flex items-center justify-center", checked ? "bg-navy" : "border border-line")}>
        {checked && <Check size={13} className="text-white" />}
      </div>
    </button>
  );
}

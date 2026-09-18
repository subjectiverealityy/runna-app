"use client";
import { ArrowLeft, Info, Settings as SettingsIcon } from "lucide-react";

// Matches the prototype's Header exactly: a fixed three-slot bar (back
// button, centered title + optional info icon, right-side settings icon
// or custom content). Meant to be rendered once per role, in that role's
// layout, so it persists across every tab switch — not re-rendered per
// page.
export function Header({
  title,
  onBack,
  onInfo,
  onSettings,
  right,
}: {
  title: string;
  onBack?: () => void;
  onInfo?: () => void;
  onSettings?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-card">
      <div className="w-9">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-navy" />
          </button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center gap-2">
        <span className="font-semibold text-sm text-navy">{title}</span>
        {onInfo && (
          <button onClick={onInfo} className="p-0.5">
            <Info size={16} className="text-sub" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-end gap-1.5" style={{ minWidth: 36 }}>
        {onSettings && (
          <button onClick={onSettings} className="p-1 -mr-1">
            <SettingsIcon size={19} className="text-navy" />
          </button>
        )}
        {right}
      </div>
    </div>
  );
}
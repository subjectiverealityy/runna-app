"use client";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export function BottomTabs({ tabs }: { tabs: { href: string; label: string; icon: LucideIcon; badge?: number | null }[] }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex border-t border-line bg-paper">
      {tabs.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <button key={t.href} onClick={() => router.push(t.href)} className="flex-1 py-3 flex flex-col items-center gap-1">
            <t.icon size={18} className={active ? "text-navy" : "text-faint"} />
            <span className={`text-[11px] font-medium relative ${active ? "text-navy" : "text-faint"}`}>
              {t.label}
              {Boolean(t.badge) && (
                <span className="absolute -right-3 -top-1.5 rounded-full text-[9px] font-bold px-1.5 py-0.5 bg-red text-white">{t.badge}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

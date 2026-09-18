"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Search, MessageCircle, Settings as SettingsIcon } from "lucide-react";
import { InfoModal, InfoButton } from "@/components/ui/InfoModal";
import { useMockStore } from "@/lib/mock/store";

export default function OrdererLayout({ children }: { children: React.ReactNode }) {
  const [showInfo, setShowInfo] = useState(false);
  const { currentPerson } = useMockStore();
  const pathname = usePathname();
  const router = useRouter();
  const inChat = /\/orderer-messages\/[^/]+$/.test(pathname) || pathname === "/orderer-messages/support";

  useEffect(() => {
    if (!currentPerson || currentPerson.type !== "orderer") router.replace("/sign-in");
  }, [currentPerson, router]);

  if (!currentPerson || currentPerson.type !== "orderer") return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between">
      {!inChat && (
        <>
          <span className="text-sm font-semibold text-navy">Find a runner</span>
          <div className="flex items-center gap-2">
            <InfoButton onClick={() => setShowInfo(true)} />
            <a href="/orderer-settings" className="p-1">
              <SettingsIcon size={16} className="text-sub" />
            </a>
          </div>
        </>
      )}
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
      {!inChat && (
        <BottomTabs
          tabs={[
            { href: "/search", label: "Runners", icon: Search },
            { href: "/orderer-messages", label: "Messages", icon: MessageCircle },
          ]}
        />
      )}
      {showInfo && <InfoModal role="orderer" onClose={() => setShowInfo(false)} />}
    </div>
  );
}

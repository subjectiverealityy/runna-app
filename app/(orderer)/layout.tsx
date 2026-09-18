"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Search, MessageCircle } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { Header } from "@/components/ui/Header";
import { InfoModal } from "@/components/ui/InfoModal";

export default function OrdererLayout({ children }: { children: React.ReactNode }) {
  const { currentPerson } = useMockStore();
  const pathname = usePathname();
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);
  const inChat = /\/orderer-messages\/[^/]+$/.test(pathname) || pathname === "/orderer-messages/support";

  useEffect(() => {
    if (!currentPerson || currentPerson.type !== "orderer") router.replace("/sign-in");
  }, [currentPerson, router]);

  if (!currentPerson || currentPerson.type !== "orderer") return null;

  return (
    <div className="flex flex-col h-full">
      {!inChat && <Header title="Runna" onInfo={() => setShowInfo(true)} onSettings={() => router.push("/orderer-settings")} />}
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
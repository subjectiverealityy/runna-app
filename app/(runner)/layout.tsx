"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Package, MessageCircle } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { Header } from "@/components/ui/Header";
import { InfoModal } from "@/components/ui/InfoModal";

export default function RunnerLayout({ children }: { children: React.ReactNode }) {
  const { currentPerson } = useMockStore();
  const pathname = usePathname();
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);
  const inChat = /\/runner-messages\/[^/]+$/.test(pathname) || pathname === "/runner-messages/support";

  useEffect(() => {
    if (!currentPerson || currentPerson.type !== "runner") router.replace("/sign-in");
  }, [currentPerson, router]);

  if (!currentPerson || currentPerson.type !== "runner") return null;

  return (
    <div className="flex flex-col h-full">
      {!inChat && <Header title="Runna" onInfo={() => setShowInfo(true)} onSettings={() => router.push("/runner-settings")} />}
      <div className="flex-1 overflow-hidden">{children}</div>
      {!inChat && (
        <BottomTabs
          tabs={[
            { href: "/orders", label: "Orders", icon: Package },
            { href: "/runner-messages", label: "Messages", icon: MessageCircle },
          ]}
        />
      )}
      {showInfo && <InfoModal role="runner" onClose={() => setShowInfo(false)} />}
    </div>
  );
}
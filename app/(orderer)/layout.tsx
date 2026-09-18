"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Search, MessageCircle } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

export default function OrdererLayout({ children }: { children: React.ReactNode }) {
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
      <div className="flex-1 overflow-hidden">{children}</div>
      {!inChat && (
        <BottomTabs
          tabs={[
            { href: "/search", label: "Runners", icon: Search },
            { href: "/orderer-messages", label: "Messages", icon: MessageCircle },
          ]}
        />
      )}
    </div>
  );
}

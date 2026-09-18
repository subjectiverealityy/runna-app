"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Package, MessageCircle } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

export default function RunnerLayout({ children }: { children: React.ReactNode }) {
  const { currentPerson } = useMockStore();
  const pathname = usePathname();
  const router = useRouter();
  const inChat = /\/messages\/[^/]+$/.test(pathname) || pathname === "/messages/support";

  useEffect(() => {
    if (!currentPerson || currentPerson.type !== "runner") router.replace("/sign-in");
  }, [currentPerson, router]);

  if (!currentPerson || currentPerson.type !== "runner") return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">{children}</div>
      {!inChat && (
        <BottomTabs
          tabs={[
            { href: "/orders", label: "Orders", icon: Package },
            { href: "/messages", label: "Messages", icon: MessageCircle },
          ]}
        />
      )}
    </div>
  );
}

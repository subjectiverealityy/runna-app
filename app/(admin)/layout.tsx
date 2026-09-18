"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { AlertCircle, MessageCircle, Settings as SettingsIcon, Search } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { Header } from "@/components/ui/Header";
import { SignOutButton } from "@/components/ui/SignOutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentPerson, adminChats } = useMockStore();
  const pathname = usePathname();
  const router = useRouter();
  const inChat = /\/people\/[^/]+$/.test(pathname);

  useEffect(() => {
    if (!currentPerson || currentPerson.type !== "admin") router.replace("/sign-in");
  }, [currentPerson, router]);

  if (!currentPerson || currentPerson.type !== "admin") return null;
  const unreadForAdmin = Object.values(adminChats).reduce((n, c) => n + c.unreadForAdmin, 0);

  return (
    <div className="flex flex-col h-full">
      {!inChat && <Header title="Runna Admin" right={<SignOutButton />} />}
      <div className="flex-1 overflow-hidden">{children}</div>
      {!inChat && (
        <BottomTabs
          tabs={[
            { href: "/reports", label: "Reports", icon: AlertCircle },
            { href: "/feedback", label: "Feedback", icon: MessageCircle },
            { href: "/data", label: "Data", icon: SettingsIcon },
            { href: "/people", label: "People", icon: Search, badge: unreadForAdmin || null },
          ]}
        />
      )}
    </div>
  );
}
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMockStore } from "@/lib/mock/store";

// REAL IMPLEMENTATION: checks a real Supabase session and redirects a
// signed-in-but-not-yet-onboarded person to /role, or the right home for
// their role — see the backend-wired app's app/page.tsx. Here it just
// checks the mock store's currentPerson.
export default function RootPage() {
  const router = useRouter();
  const { currentPerson } = useMockStore();

  useEffect(() => {
    if (!currentPerson) return router.replace("/sign-in");
    if (currentPerson.type === "runner") return router.replace("/orders");
    if (currentPerson.type === "orderer") return router.replace("/search");
    if (currentPerson.type === "admin") return router.replace("/reports");
  }, [currentPerson, router]);

  return null;
}

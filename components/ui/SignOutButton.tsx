"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

// REAL IMPLEMENTATION: calls supabase.auth.signOut() then redirects — see
// the backend-wired app's components/ui/SignOutButton.tsx. Here it just
// clears the mock "who am I" identity.
export function SignOutButton() {
  const router = useRouter();
  const { signOut } = useMockStore();
  return (
    <button
      onClick={() => {
        signOut();
        router.replace("/sign-in");
      }}
      className="flex items-center gap-1.5 text-xs font-semibold text-red"
    >
      <LogOut size={13} />
      Sign out
    </button>
  );
}

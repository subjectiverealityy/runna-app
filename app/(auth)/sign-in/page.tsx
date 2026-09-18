"use client";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useMockStore } from "@/lib/mock/store";
import { MOCK_RUNNERS, MOCK_ORDERERS, MOCK_ADMIN } from "@/lib/mock/data";

// REAL IMPLEMENTATION: a single "Sign in with Google" button that starts a
// real OAuth flow via Supabase Auth — see the backend-wired app's
// app/(auth)/sign-in/page.tsx and app/auth/callback/route.ts. There is no
// real identity here, so this screen exists ONLY in the frontend-only
// build: it lets you pick which seeded person you're viewing the app as,
// so every role's screens are actually reachable without a backend. This
// whole picker goes away once real auth exists.
export default function SignInPage() {
  const router = useRouter();
  const { signInAs } = useMockStore();

  const pick = (id: string, home: string) => {
    signInAs(id);
    router.push(home);
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-10 pb-6 overflow-y-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 -rotate-3 bg-navy">
          <ShoppingBag size={28} className="text-amber" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-navy">Runna</h1>
        <p className="text-sm mt-2 max-w-[260px] text-sub">
          Frontend-only preview — pick a seeded person to view their screens. No backend, no real
          auth; this picker disappears once Google sign-in is wired up for real.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={() => pick(MOCK_ADMIN.id, "/reports")}>Continue as Admin ({MOCK_ADMIN.name})</Button>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-faint">Runners</p>
      <div className="space-y-2 mb-6">
        {MOCK_RUNNERS.map((r) => (
          <button
            key={r.id}
            onClick={() => pick(r.id, "/orders")}
            className="w-full flex items-center justify-between rounded-xl px-4 py-3 border border-line bg-card text-left"
          >
            <span className="text-sm font-medium text-ink">{r.name}</span>
            <span className="font-mono text-xs text-faint">#{r.code}</span>
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-faint">Orderers</p>
      <div className="space-y-2 mb-6">
        {MOCK_ORDERERS.map((o) => (
          <button
            key={o.id}
            onClick={() => pick(o.id, "/search")}
            className="w-full flex items-center justify-between rounded-xl px-4 py-3 border border-line bg-card text-left"
          >
            <span className="text-sm font-medium text-ink">{o.name}</span>
            <span className="font-mono text-xs text-faint">#{o.code}</span>
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-line">
        <p className="text-xs text-sub mb-3">Or go through onboarding as a brand new person:</p>
        <Button tone="ghost" onClick={() => router.push("/role")}>
          Start fresh onboarding
        </Button>
      </div>
    </div>
  );
}

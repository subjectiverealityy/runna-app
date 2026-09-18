"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CodeChip } from "@/components/ui/CodeChip";
import { FeedbackModal } from "@/components/ui/FeedbackModal";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { useMockStore } from "@/lib/mock/store";

// REAL IMPLEMENTATION: PATCH /api/settings for the name field; wallet
// top-up is POST /api/wallet/top-up, which verifies the Flutterwave
// transaction server-side and credits atomically (a real lost-update race
// was found in an earlier read-then-write version — see the migration's
// increment_wallet_balance comment in the backend-wired app). Here
// top-up is instant and untracked, since there's no real payment provider
// wired up at all in this build.
export default function OrdererSettingsPage() {
  const { currentPerson, updateRunnerProfile, topUpWallet } = useMockStore();
  const [name, setName] = useState("");
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (currentPerson) setName(currentPerson.name);
  }, [currentPerson]);

  if (!currentPerson) return null;

  return (
    <div className="px-5 py-5 space-y-6 overflow-y-auto h-full">
      <div>
        <label className="text-xs font-semibold text-sub">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => updateRunnerProfile({ name })} className="w-full mt-1.5 rounded-xl px-3.5 py-3 text-sm border border-line bg-card outline-none" />
      </div>
      <div>
        <p className="text-xs font-semibold text-sub">Your code</p>
        <div className="mt-1.5"><CodeChip>#{currentPerson.code}</CodeChip></div>
      </div>
      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Wallet</p>
        <div className="rounded-xl p-4 flex items-center justify-between bg-navy">
          <div>
            <p className="text-[11px]" style={{ color: "#B9C0D1" }}>Balance</p>
            <p className="font-mono font-semibold text-lg text-white mt-0.5">₦{currentPerson.walletBalance.toLocaleString("en-NG")}</p>
          </div>
          <button onClick={() => setShowAddFunds(true)} className="rounded-lg px-3 py-2 text-xs font-semibold bg-amber text-navyDeep">Add funds</button>
        </div>
      </div>
      <button onClick={() => setShowFeedback(true)} className="text-xs font-semibold text-sub underline">Send feedback</button>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      <div className="pt-2 border-t border-line">
        <SignOutButton />
      </div>
      {showAddFunds && <AddFundsModal onClose={() => setShowAddFunds(false)} onAdd={topUpWallet} />}
    </div>
  );
}

function AddFundsModal({ onClose, onAdd }: { onClose: () => void; onAdd: (amount: number) => void }) {
  const [amount, setAmount] = useState("");
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl p-5 bg-paper">
        <label className="text-xs font-semibold text-sub">Amount (₦)</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} className="w-full mt-1.5 mb-5 rounded-xl px-3.5 py-3 text-sm border border-line outline-none font-mono" />
        <Button
          onClick={() => {
            onAdd(Number(amount));
            onClose();
          }}
        >
          Add funds via Flutterwave
        </Button>
      </div>
    </div>
  );
}

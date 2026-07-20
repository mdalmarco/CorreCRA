"use client";

import { useState, useTransition } from "react";
import { joinChallenge } from "@/lib/actions/challenge";
import { Button } from "@/components/ui/button";

export function JoinChallengeButton({ fee }: { fee: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  function handleJoin() {
    startTransition(async () => {
      const res = await joinChallenge();
      setResult(res);
    });
  }

  if (result?.success) {
    return (
      <p className="text-sm text-neutral-300">
        Solicitacao enviada! Assim que o pagamento for confirmado por um organizador, voce vira VIP.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleJoin}
        disabled={isPending}
        className="w-full bg-[#F5C518] text-black hover:bg-[#e0b310]"
      >
        {isPending ? "Enviando..." : `Participar do Desafio CRA 2026 — R$ ${fee.toFixed(2)}`}
      </Button>
      {result?.error && <p className="text-sm text-red-400">{result.error}</p>}
    </div>
  );
}

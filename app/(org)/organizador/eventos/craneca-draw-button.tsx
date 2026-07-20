"use client";

import { useState, useTransition } from "react";
import { runCranecaDraw } from "@/lib/actions/organizer";
import { Button } from "@/components/ui/button";

export function CranecaDrawButton({
  eventId,
  existingWinnerName,
}: {
  eventId: string;
  existingWinnerName: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [winnerName, setWinnerName] = useState(existingWinnerName);
  const [error, setError] = useState<string | null>(null);

  function handleDraw() {
    startTransition(async () => {
      const res = await runCranecaDraw(eventId);
      if (res.error) {
        setError(res.error);
        return;
      }
      setWinnerName(res.winnerName ?? null);
    });
  }

  if (winnerName) {
    return (
      <p className="rounded-lg bg-[#F5C518]/20 px-3 py-2 text-sm font-medium">
        🧉 CRAneca sorteada: <strong>{winnerName}</strong>
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <Button size="sm" variant="outline" disabled={isPending} onClick={handleDraw}>
        {isPending ? "Sorteando..." : "🧉 Sortear CRAneca"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

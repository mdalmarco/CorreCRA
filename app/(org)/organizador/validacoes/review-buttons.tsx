"use client";

import { useState, useTransition } from "react";
import { reviewPointRequest } from "@/lib/actions/organizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReviewButtons({
  requestId,
  requestedPoints,
}: {
  requestId: string;
  requestedPoints: number;
}) {
  const [notes, setNotes] = useState("");
  const [points, setPoints] = useState(String(requestedPoints));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDecision(decision: "approved" | "rejected") {
    startTransition(async () => {
      const res = await reviewPointRequest(requestId, decision, Number(points), notes);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="space-y-2 border-t pt-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="w-20"
        />
        <Input
          placeholder="Observacao (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1"
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => handleDecision("approved")}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          Aprovar
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => handleDecision("rejected")}
        >
          Rejeitar
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

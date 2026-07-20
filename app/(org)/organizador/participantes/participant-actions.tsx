"use client";

import { useState, useTransition } from "react";
import { confirmPayment, setParticipantStatus, manualPointAdjustment } from "@/lib/actions/organizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ParticipantActions({
  participantId,
  challengeId,
  paymentStatus,
  participantStatus,
  hasEnrollment,
}: {
  participantId: string;
  challengeId: string;
  paymentStatus: string;
  participantStatus: string;
  hasEnrollment: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [showAdjust, setShowAdjust] = useState(false);
  const [points, setPoints] = useState("0");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAdjust() {
    startTransition(async () => {
      const res = await manualPointAdjustment(participantId, challengeId, Number(points), reason);
      if (res.error) setError(res.error);
      else {
        setShowAdjust(false);
        setPoints("0");
        setReason("");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {paymentStatus !== "confirmed" && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(async () => { await confirmPayment(participantId, challengeId); })}
          >
            {hasEnrollment ? "Confirmar pagamento" : "Confirmar pagamento (virar VIP)"}
          </Button>
        )}
        {hasEnrollment && (
          participantStatus !== "suspended" ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => startTransition(async () => { await setParticipantStatus(participantId, challengeId, "suspended"); })}
            >
              Suspender
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => startTransition(async () => { await setParticipantStatus(participantId, challengeId, "active"); })}
            >
              Reativar
            </Button>
          )
        )}
        <Button size="sm" variant="ghost" onClick={() => setShowAdjust((v) => !v)}>
          Ajustar pontos
        </Button>
      </div>

      {showAdjust && (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex gap-2">
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-24"
              placeholder="+/- pts"
            />
            <Input
              placeholder="Justificativa (obrigatoria)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button size="sm" disabled={isPending || reason.trim().length < 5} onClick={handleAdjust}>
            Confirmar ajuste
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}

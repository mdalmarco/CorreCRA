"use client";

import { useState, useTransition } from "react";
import { QRCodeSVG } from "qrcode.react";
import { generateEventQrToken } from "@/lib/actions/organizer";
import { Button } from "@/components/ui/button";

export function QrCodeButton({
  eventId,
  qrToken,
  qrTokenExpiresAt,
}: {
  eventId: string;
  qrToken: string | null;
  qrTokenExpiresAt: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState(qrToken);
  const [expiresAt, setExpiresAt] = useState(qrTokenExpiresAt);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expired = expiresAt ? new Date(expiresAt) < new Date() : true;

  function handleGenerate() {
    startTransition(async () => {
      const res = await generateEventQrToken(eventId);
      if (res.error) {
        setError(res.error);
        return;
      }
      setToken(res.token ?? null);
      setExpiresAt(res.expiresAt ?? null);
      setOpen(true);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={isPending} onClick={handleGenerate}>
          {token && !expired ? "Renovar QR Code" : "Gerar QR Code"}
        </Button>
        {token && !expired && (
          <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
            {open ? "Ocultar" : "Mostrar"}
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {open && token && !expired && (
        <div className="flex flex-col items-center gap-2 rounded-lg border bg-white p-4">
          <QRCodeSVG value={token} size={180} />
          <p className="text-xs text-[#9a9aa2]">
            Expira em {new Date(expiresAt!).toLocaleTimeString("pt-BR")}
          </p>
        </div>
      )}
    </div>
  );
}

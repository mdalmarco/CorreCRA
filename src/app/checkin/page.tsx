"use client";

import { useState, useTransition } from "react";
import { checkInByCode } from "@/lib/actions/checkin";

export default function CheckinPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ error?: string; success?: boolean; eventName?: string; points?: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await checkInByCode(code.trim().toUpperCase());
      setResult(res);
      if (res.success) setCode("");
    });
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-10">
      <h1 className="text-2xl font-bold">Check-in</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Digite o código do evento informado pelo organizador. Suporte a leitura
        por QR Code entra na próxima versão.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CÓDIGO DO EVENTO"
          className="w-full rounded-lg border px-4 py-3 text-center text-lg tracking-widest uppercase"
          maxLength={12}
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-cra-yellow py-4 text-lg font-bold disabled:opacity-50"
        >
          {isPending ? "Confirmando..." : "Confirmar check-in"}
        </button>
      </form>

      {result?.success && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
          Check-in em <strong>{result.eventName}</strong> confirmado!
          {result.points ? ` +${result.points} pontos.` : ""}
        </div>
      )}
      {result?.error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">{result.error}</div>
      )}
    </main>
  );
}

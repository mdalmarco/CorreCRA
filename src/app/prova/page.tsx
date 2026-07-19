"use client";

import { useState, useTransition } from "react";
import { registerExternalRace } from "@/lib/actions/external-race";

export default function RegistrarProvaPage() {
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await registerExternalRace(formData);
      setResult(res);
      if (res.success) (e.target as HTMLFormElement).reset();
    });
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-bold">Registrar prova externa</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Inscrição como equipe CRA e uso da camisa CRA são avaliados
        separadamente pelo organizador.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome da prova</label>
          <input name="name" required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Data</label>
            <input name="race_date" type="date" required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Distância</label>
            <input name="distance" placeholder="10km" className="mt-1 w-full rounded-lg border px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Cidade</label>
          <input name="city" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Link oficial (opcional)</label>
          <input name="official_url" type="url" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>

        <div className="space-y-2 rounded-lg border p-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="used_cra_registration" /> Inscrição como equipe CRA (5 pts)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="used_cra_shirt" /> Participei com a camisa CRA (3 pts)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">Comprovante</label>
          <input
            name="comprovante"
            type="file"
            required
            accept="image/*,application/pdf"
            className="mt-1 w-full text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-cra-yellow py-3 font-bold disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Enviar para análise"}
        </button>

        {result?.success && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Enviado! Acompanhe o status no seu extrato.
          </p>
        )}
        {result?.error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</p>
        )}
      </form>
    </main>
  );
}

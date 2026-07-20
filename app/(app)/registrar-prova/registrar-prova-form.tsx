"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerExternalRace } from "@/lib/actions/external-race";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";

export function RegistrarProvaForm() {
  const router = useRouter();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await registerExternalRace(formData);
      setResult(res);
      if (res.success) {
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">Registrar prova externa</h1>
      <Card>
        <CardHeader>
          <CardDescription>
            Inscricao como equipe CRA e uso da camisa CRA sao avaliados separadamente pelo
            organizador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da prova</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="race_date">Data</Label>
                <Input id="race_date" name="race_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distancia</Label>
                <Input id="distance" name="distance" placeholder="10km" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="official_url">Link oficial (opcional)</Label>
              <Input id="official_url" name="official_url" type="url" />
            </div>

            <Card className="border-dashed">
              <CardContent className="space-y-2 pt-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="used_cra_registration" className="h-4 w-4" />
                  Inscricao como equipe CRA (5 pts)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="used_cra_shirt" className="h-4 w-4" />
                  Participei com a camisa CRA (3 pts)
                </label>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="comprovante">Comprovante</Label>
              <input
                id="comprovante"
                name="comprovante"
                type="file"
                required
                accept="image/*,application/pdf"
                className="block w-full text-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#F5C518] text-black hover:bg-[#e0b310]"
              disabled={isPending}
            >
              {isPending ? "Enviando..." : "Enviar para analise"}
            </Button>

            {result?.success && (
              <p className="text-sm text-green-600">Enviado! Redirecionando...</p>
            )}
            {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { createEvent } from "@/lib/actions/organizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityType {
  id: string;
  name: string;
  default_points: number;
}

export function CreateEventForm({ activityTypes }: { activityTypes: ActivityType[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createEvent(formData);
      setResult(res);
      if (res.success) (e.target as HTMLFormElement).reset();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Novo evento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity_type_id">Tipo de atividade</Label>
            <select
              id="activity_type_id"
              name="activity_type_id"
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
              onChange={(e) => {
                const opt = activityTypes.find((a) => a.id === e.target.value);
                const pointsInput = document.getElementById("points") as HTMLInputElement | null;
                if (opt && pointsInput) pointsInput.value = String(opt.default_points);
              }}
            >
              <option value="">Selecione...</option>
              {activityTypes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Pontos</Label>
              <Input id="points" name="points" type="number" defaultValue={2} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkin_code">Código de check-in</Label>
            <Input id="checkin_code" name="checkin_code" placeholder="Ex: CRA482" required className="uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_at">Data/hora do evento</Label>
              <Input id="start_at" name="start_at" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkin_end_at">Check-in encerra em</Label>
              <Input id="checkin_end_at" name="checkin_end_at" type="datetime-local" />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full bg-[#F5C518] text-black hover:bg-[#e0b310]">
            {isPending ? "Criando..." : "Criar e abrir check-in"}
          </Button>
          {result?.success && <p className="text-sm text-green-600">Evento criado!</p>}
          {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

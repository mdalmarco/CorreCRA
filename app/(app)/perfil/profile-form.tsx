"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileData {
  display_name: string | null;
  city: string | null;
  phone: string | null;
  shirt_size: string | null;
  birth_date: string | null;
}

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfile(formData);
      setResult(res);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="display_name">Nome de exibicao</Label>
        <Input id="display_name" name="display_name" defaultValue={profile.display_name ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Cidade</Label>
        <Input id="city" name="city" defaultValue={profile.city ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shirt_size">Tamanho da camisa</Label>
          <select
            id="shirt_size"
            name="shirt_size"
            defaultValue={profile.shirt_size ?? ""}
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {["PP", "P", "M", "G", "GG", "XG"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="birth_date">Data de nascimento</Label>
        <Input id="birth_date" name="birth_date" type="date" defaultValue={profile.birth_date ?? ""} />
      </div>
      <Button type="submit" disabled={isPending} className="w-full bg-[#F5C518] text-black hover:bg-[#e0b310]">
        {isPending ? "Salvando..." : "Salvar alteracoes"}
      </Button>
      {result?.success && <p className="text-sm text-green-600">Perfil atualizado!</p>}
      {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
    </form>
  );
}

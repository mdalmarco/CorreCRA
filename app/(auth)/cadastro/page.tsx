"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Não foi possivel criar a conta.");
      return;
    }

    // O perfil e criado automaticamente por um trigger no banco (on_auth_user_created),
    // entao não precisamos inserir aqui — evita falha de RLS quando a confirmação de
    // e-mail esta ativa e ainda não ha sessao autenticada nesse momento.
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (done) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#0a0a0b] px-4 text-center">
        <Image src="/cra-logo.png" alt="CRA" width={72} height={72} className="rounded-full" />
        <div>
          <h1 className="text-xl font-semibold">Cadastro realizado!</h1>
          <p className="mt-2 text-neutral-500">
            Confirme seu e-mail e faça login para completar o perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#0a0a0b] px-4">
      <Image src="/cra-logo.png" alt="CRA" width={72} height={72} className="rounded-full" />
      <Card className="w-full max-w-sm border-[#2c2c32]">
        <CardHeader>
          <CardTitle className="text-xl">Participar do Desafio CRA 2026</CardTitle>
          <CardDescription>
            Cadastro gratuito. Participe do Desafio CRA 2026 (R$ 20,00) quando quiser, direto do
            seu perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full bg-[#F5C518] text-black hover:bg-[#e0b310]" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

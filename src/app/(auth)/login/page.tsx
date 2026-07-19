"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleMagicLink}
        className="w-full max-w-sm space-y-4 rounded-xl border p-6"
      >
        <h1 className="text-xl font-bold">Entrar no Desafio CRA</h1>
        {sent ? (
          <p className="text-sm text-neutral-600">
            Link de acesso enviado para {email}. Confira sua caixa de entrada.
          </p>
        ) : (
          <>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-cra-black py-2 font-semibold text-white"
            >
              Enviar link de acesso
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </>
        )}
      </form>
    </main>
  );
}

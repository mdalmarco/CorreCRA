"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckinPage() {
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setStatus("error");
      setMessage("Não autenticado.");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("checkin_code", code.trim().toUpperCase())
      .eq("status", "checkin_open")
      .maybeSingle();

    if (!event || !profile) {
      setStatus("error");
      setMessage("Codigo invalido ou check-in nao esta aberto.");
      return;
    }

    const { error } = await supabase.rpc("fn_do_checkin", {
      p_event_id: event.id,
      p_participant_id: profile.id,
      p_method: "event_code",
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Check-in confirmado! Pontos creditados.");
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">Check-in</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Digitar codigo do evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckin} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="code">Codigo</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: CRA482"
                className="text-center text-lg tracking-widest uppercase"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#F5C518] text-black hover:bg-[#e0b310]"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Confirmando..." : "Confirmar check-in"}
            </Button>
            {message && (
              <p className={status === "error" ? "text-sm text-red-600" : "text-sm text-green-600"}>
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-neutral-400">
        Escaneamento de QR Code disponivel em breve nesta mesma tela.
      </p>
    </div>
  );
}

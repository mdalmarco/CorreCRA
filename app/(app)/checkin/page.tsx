"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrScanner } from "./qr-scanner";

type CheckinMethod = "event_code" | "qr_code";

export default function CheckinPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<"codigo" | "qrcode">("codigo");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [eventName, setEventName] = useState("");
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [isVip, setIsVip] = useState(true);

  async function performCheckin(method: CheckinMethod, lookup: { checkin_code?: string; qr_token?: string }) {
    setStatus("loading");
    setMessage("");

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

    let query = supabase
      .from("events")
      .select("id, name, points, challenge_id, qr_token_expires_at")
      .eq("status", "checkin_open");
    if (lookup.checkin_code) query = query.eq("checkin_code", lookup.checkin_code);
    if (lookup.qr_token) query = query.eq("qr_token", lookup.qr_token);

    const { data: event } = await query.maybeSingle();

    if (!event || !profile) {
      setStatus("error");
      setMessage(
        method === "qr_code"
          ? "QR Code invalido, expirado ou check-in nao esta aberto."
          : "Codigo invalido ou check-in nao esta aberto."
      );
      return;
    }

    if (method === "qr_code" && event.qr_token_expires_at && new Date(event.qr_token_expires_at) < new Date()) {
      setStatus("error");
      setMessage("QR Code expirado. Peca ao organizador para gerar um novo.");
      return;
    }

    const { data: enrollment } = await supabase
      .from("challenge_participants")
      .select("status, payment_status")
      .eq("participant_id", profile.id)
      .eq("challenge_id", event.challenge_id)
      .maybeSingle();

    const vip = enrollment?.status === "active" && enrollment?.payment_status === "confirmed";

    const { error } = await supabase.rpc("fn_do_checkin", {
      p_event_id: event.id,
      p_participant_id: profile.id,
      p_method: method,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setIsVip(vip);
    setEventName(event.name);
    setPointsEarned(vip ? event.points : null);
    setStatus("success");
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    performCheckin("event_code", { checkin_code: code.trim().toUpperCase() });
  }

  const handleQrScan = useCallback((decodedText: string) => {
    // QR encoda apenas o qr_token bruto (gerado pelo organizador, expira em 4h)
    performCheckin("qr_code", { qr_token: decodedText.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">Check-in</h1>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === "codigo" ? "default" : "outline"}
          onClick={() => setTab("codigo")}
        >
          Digitar codigo
        </Button>
        <Button
          size="sm"
          variant={tab === "qrcode" ? "default" : "outline"}
          onClick={() => setTab("qrcode")}
        >
          Escanear QR Code
        </Button>
      </div>

      {tab === "codigo" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Digitar codigo do evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCodeSubmit} className="space-y-3">
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
            </form>
          </CardContent>
        </Card>
      )}

      {tab === "qrcode" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aponte a camera para o QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <QrScanner active={tab === "qrcode" && status !== "success"} onScan={handleQrScan} />
            {status === "loading" && (
              <p className="mt-2 text-center text-sm text-neutral-500">Confirmando...</p>
            )}
          </CardContent>
        </Card>
      )}

      {status === "success" && isVip && (
        <Card className="border-2 border-[#F5C518] bg-neutral-950 text-white">
          <CardContent className="space-y-1 pt-6 text-center">
            <p className="text-sm text-neutral-300">Check-in confirmado em {eventName}</p>
            <p className="text-3xl font-bold text-[#F5C518]">+{pointsEarned} pontos</p>
          </CardContent>
        </Card>
      )}

      {status === "success" && !isVip && (
        <Card className="border-dashed">
          <CardContent className="space-y-2 pt-6 text-center">
            <p className="font-medium">Presença registrada em {eventName} ✓</p>
            <p className="text-sm text-neutral-500">
              Sua conta e livre, entao esse check-in nao vale pontos ainda. Participe do Desafio
              CRA 2026 pra pontuar a partir do proximo corre.
            </p>
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-[#F5C518] px-4 py-2 text-sm font-semibold text-black"
            >
              Participar do desafio
            </Link>
          </CardContent>
        </Card>
      )}

      {status === "error" && message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}

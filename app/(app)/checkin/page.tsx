"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { QrScanner } from "./qr-scanner";

type CheckinMethod = "event_code" | "qr_code";

export default function CheckinPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<"código" | "qrcode">("código");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [eventName, setEventName] = useState("");
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [isVip, setIsVip] = useState(true);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeesTotal, setAttendeesTotal] = useState(0);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (status === "success" && isVip && !confettiFired.current) {
      confettiFired.current = true;
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.4 },
          colors: ["#F5C518", "#C9A227", "#B6FF3C", "#ffffff"],
        });
      });
    }
  }, [status, isVip]);

  async function performCheckin(method: CheckinMethod, lookup: { checkin_code?: string; qr_token?: string }) {
    setStatus("loading");
    setMessage("");
    confettiFired.current = false;

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
          ? "QR Code invalido ou expirado. Confere com o organizador."
          : "Código invalido. Confere e tenta de novo."
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

    const { data: attendanceRows } = await supabase
      .from("event_attendance_view")
      .select("participant_id, full_name")
      .eq("event_id", event.id);

    const others = (attendanceRows ?? []).filter((a) => a.participant_id !== profile.id);
    setAttendeesTotal(others.length);
    setAttendees(others.slice(0, 5).map((a) => a.full_name ?? "").filter(Boolean));

    setStatus("success");
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    performCheckin("event_code", { checkin_code: code.trim().toUpperCase() });
  }

  const handleQrScan = useCallback((decodedText: string) => {
    performCheckin("qr_code", { qr_token: decodedText.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "success") {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 p-6 pb-24 text-center">
        {isVip ? (
          <>
            <span className="text-5xl">🔥</span>
            <p className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[#f5f5f0]">
              BOA! CHECK-IN CONFIRMADO
            </p>
            <p className="text-sm text-[#9a9aa2]">{eventName}</p>
            <p className="font-[family-name:var(--font-display)] text-5xl text-[#F5C518]">
              +{pointsEarned} pts
            </p>
          </>
        ) : (
          <>
            <span className="text-5xl">✓</span>
            <p className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[#f5f5f0]">
              PRESENCA REGISTRADA
            </p>
            <p className="text-sm text-[#9a9aa2]">{eventName}</p>
            <p className="max-w-xs text-sm text-[#9a9aa2]">
              Sua conta e livre, entao esse check-in ainda não vale pontos. Entre no Desafio CRA
              2026 pra comecar a subir de nível a partir do próximo corre.
            </p>
            <Link
              href="/dashboard"
              className="rounded-xl bg-[#F5C518] px-6 py-3 text-sm font-bold text-black"
            >
              Participar do desafio
            </Link>
          </>
        )}

        {attendeesTotal > 0 && (
          <div className="mt-2 rounded-2xl border border-[#2c2c32] bg-[#17171a] px-4 py-3 text-sm text-[#9a9aa2]">
            {attendees.length > 0 ? (
              <p>
                Correu junto hoje: <strong className="text-[#f5f5f0]">{attendees.join(", ")}</strong>
                {attendeesTotal > attendees.length && ` e mais ${attendeesTotal - attendees.length}`}
              </p>
            ) : (
              <p>Mais {attendeesTotal} pessoa(s) fizeram check-in nesse corre.</p>
            )}
          </div>
        )}

        <Link href="/dashboard" className="mt-4 text-xs text-[#6f6f78] underline">
          Voltar ao inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-24">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[#f5f5f0]">
        CHECK-IN
      </h1>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("código")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "código" ? "bg-[#F5C518] text-black" : "border border-[#2c2c32] text-[#9a9aa2]"
          }`}
        >
          Digitar código
        </button>
        <button
          onClick={() => setTab("qrcode")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "qrcode" ? "bg-[#F5C518] text-black" : "border border-[#2c2c32] text-[#9a9aa2]"
          }`}
        >
          Escanear QR Code
        </button>
      </div>

      {tab === "código" && (
        <div className="cra-glass rounded-2xl p-5">
          <form onSubmit={handleCodeSubmit} className="space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: CRA482"
              className="w-full rounded-xl border border-[#2c2c32] bg-[#0a0a0b] px-4 py-3 text-center text-lg uppercase tracking-widest text-[#f5f5f0] placeholder:text-[#4a4a52]"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-xl bg-[#F5C518] py-3 text-sm font-bold text-black disabled:opacity-50"
            >
              {status === "loading" ? "Confirmando..." : "Confirmar check-in"}
            </button>
          </form>
        </div>
      )}

      {tab === "qrcode" && (
        <div className="cra-glass rounded-2xl p-5">
          <p className="mb-3 text-center text-sm text-[#9a9aa2]">Aponte a camera para o QR Code</p>
          <QrScanner active={tab === "qrcode"} onScan={handleQrScan} />
          {status === "loading" && <p className="mt-2 text-center text-sm text-[#9a9aa2]">Confirmando...</p>}
        </div>
      )}

      {status === "error" && message && <p className="text-sm text-red-400">{message}</p>}
    </div>
  );
}

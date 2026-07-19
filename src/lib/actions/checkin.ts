"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function checkInByCode(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, participant_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return { error: "Perfil não encontrado." };
  if (profile.participant_status !== "active") {
    return { error: "Sua inscrição ainda não está ativa." };
  }

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("checkin_code", code)
    .eq("status", "checkin_open")
    .maybeSingle();

  if (!event) return { error: "Código inválido ou check-in encerrado." };

  const now = new Date();
  if (event.checkin_start_at && now < new Date(event.checkin_start_at)) {
    return { error: "Check-in ainda não abriu para este evento." };
  }
  if (event.checkin_end_at && now > new Date(event.checkin_end_at)) {
    return { error: "Janela de check-in encerrada." };
  }

  const { data: existing } = await supabase
    .from("event_checkins")
    .select("id")
    .eq("event_id", event.id)
    .eq("participant_id", profile.id)
    .maybeSingle();

  if (existing) return { error: "Você já fez check-in neste evento." };

  const { error: checkinError } = await supabase.from("event_checkins").insert({
    event_id: event.id,
    participant_id: profile.id,
    checkin_method: "event_code",
    status: "valid",
  });

  if (checkinError) return { error: "Erro ao registrar check-in: " + checkinError.message };

  if (event.activity_type_id && event.points) {
    await supabase.from("point_ledger").insert({
      challenge_id: event.challenge_id,
      participant_id: profile.id,
      activity_type_id: event.activity_type_id,
      event_id: event.id,
      transaction_type: "checkin",
      points: event.points,
      status: "validated",
      description: `Check-in: ${event.name}`,
      approved_at: new Date().toISOString(),
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/extrato");
  return { success: true, eventName: event.name, points: event.points };
}

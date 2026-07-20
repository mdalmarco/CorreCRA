"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getReviewerProfileId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, reviewerId: null as string | null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return { supabase, reviewerId: profile?.id ?? null };
}

export async function reviewPointRequest(
  requestId: string,
  decision: "approved" | "rejected" | "partially_approved",
  approvedPoints: number,
  notes: string
) {
  const { supabase, reviewerId } = await getReviewerProfileId();
  if (!reviewerId) return { error: "Nao autenticado." };

  const { error } = await supabase.rpc("fn_review_point_request", {
    p_request_id: requestId,
    p_reviewer_id: reviewerId,
    p_new_status: decision,
    p_approved_points: approvedPoints,
    p_reviewer_notes: notes,
  });

  if (error) return { error: error.message };
  revalidatePath("/organizador/validacoes");
  return { success: true };
}

export async function manualPointAdjustment(
  participantId: string,
  challengeId: string,
  points: number,
  reason: string
) {
  const { supabase, reviewerId } = await getReviewerProfileId();
  if (!reviewerId) return { error: "Nao autenticado." };

  const { error } = await supabase.rpc("fn_manual_point_adjustment", {
    p_participant_id: participantId,
    p_challenge_id: challengeId,
    p_points: points,
    p_reason: reason,
    p_actor_id: reviewerId,
  });

  if (error) return { error: error.message };
  revalidatePath("/organizador/participantes");
  return { success: true };
}

export async function confirmPayment(participantId: string) {
  const { supabase, reviewerId } = await getReviewerProfileId();
  if (!reviewerId) return { error: "Nao autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({ payment_status: "confirmed", participant_status: "active" })
    .eq("id", participantId);

  if (error) return { error: error.message };
  revalidatePath("/organizador/participantes");
  return { success: true };
}

export async function setParticipantStatus(
  participantId: string,
  status: "active" | "suspended" | "closed"
) {
  const { supabase, reviewerId } = await getReviewerProfileId();
  if (!reviewerId) return { error: "Nao autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({ participant_status: status })
    .eq("id", participantId);

  if (error) return { error: error.message };
  revalidatePath("/organizador/participantes");
  return { success: true };
}

export async function generateEventQrToken(eventId: string) {
  const { supabase, reviewerId } = await getReviewerProfileId();
  if (!reviewerId) return { error: "Nao autenticado." };

  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4h

  const { error } = await supabase
    .from("events")
    .update({ qr_token: token, qr_token_expires_at: expiresAt })
    .eq("id", eventId);

  if (error) return { error: error.message };
  revalidatePath("/organizador/eventos");
  return { success: true, token, expiresAt };
}

export async function createEvent(formData: FormData) {
  const { supabase, reviewerId } = await getReviewerProfileId();
  if (!reviewerId) return { error: "Nao autenticado." };

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!challenge) return { error: "Nenhum desafio ativo." };

  const activityTypeId = String(formData.get("activity_type_id") ?? "");
  const name = String(formData.get("name") ?? "");
  const city = String(formData.get("city") ?? "");
  const startAt = String(formData.get("start_at") ?? "");
  const checkinStartAt = String(formData.get("checkin_start_at") ?? "");
  const checkinEndAt = String(formData.get("checkin_end_at") ?? "");
  const points = Number(formData.get("points") ?? 0);
  const checkinCode = String(formData.get("checkin_code") ?? "")
    .trim()
    .toUpperCase();

  if (!name || !startAt || !activityTypeId || !checkinCode) {
    return { error: "Preencha nome, atividade, data e codigo de check-in." };
  }

  const { error } = await supabase.from("events").insert({
    challenge_id: challenge.id,
    activity_type_id: activityTypeId,
    name,
    city: city || null,
    start_at: startAt,
    checkin_start_at: checkinStartAt || startAt,
    checkin_end_at: checkinEndAt || null,
    checkin_code: checkinCode,
    points,
    status: "checkin_open",
    created_by: reviewerId,
  });

  if (error) return { error: error.message };
  revalidatePath("/organizador/eventos");
  return { success: true };
}

export async function closeEventCheckin(eventId: string) {
  const { supabase, reviewerId } = await getReviewerProfileId();
  if (!reviewerId) return { error: "Nao autenticado." };

  const { error } = await supabase
    .from("events")
    .update({ status: "checkin_closed" })
    .eq("id", eventId);

  if (error) return { error: error.message };
  revalidatePath("/organizador/eventos");
  return { success: true };
}

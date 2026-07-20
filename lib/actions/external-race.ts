"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerExternalRace(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) return { error: "Perfil não encontrado." };

  const name = String(formData.get("name") ?? "");
  const raceDate = String(formData.get("race_date") ?? "");
  const city = String(formData.get("city") ?? "");
  const distance = String(formData.get("distance") ?? "");
  const officialUrl = String(formData.get("official_url") ?? "");
  const usedCraRegistration = formData.get("used_cra_registration") === "on";
  const usedCraShirt = formData.get("used_cra_shirt") === "on";
  const file = formData.get("comprovante") as File | null;

  if (!name || !raceDate) return { error: "Preencha nome e data da prova." };
  if (!usedCraRegistration && !usedCraShirt) {
    return { error: "Selecione ao menos um item: inscrição CRA ou camisa CRA." };
  }
  if (!file || file.size === 0) return { error: "Anexe um comprovante." };

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!challenge) return { error: "Nenhum desafio ativo encontrado." };

  const { data: enrollment } = await supabase
    .from("challenge_participants")
    .select("status, payment_status")
    .eq("participant_id", profile.id)
    .eq("challenge_id", challenge.id)
    .maybeSingle();

  if (enrollment?.status !== "active" || enrollment?.payment_status !== "confirmed") {
    return { error: "Você precisa ser VIP do desafio (pagamento confirmado) para registrar provas." };
  }

  const { data: activityTypes } = await supabase
    .from("activity_types")
    .select("id, name")
    .eq("challenge_id", challenge.id)
    .in("name", ["Inscrição em prova como equipe CRA", "Prova com camisa CRA"]);

  const registrationType = activityTypes?.find((a) => a.name === "Inscrição em prova como equipe CRA");
  const shirtType = activityTypes?.find((a) => a.name === "Prova com camisa CRA");

  const { data: race, error: raceError } = await supabase
    .from("external_races")
    .insert({
      participant_id: profile.id,
      name,
      race_date: raceDate,
      city: city || null,
      distance: distance || null,
      official_url: officialUrl || null,
      used_cra_registration: usedCraRegistration,
      used_cra_shirt: usedCraShirt,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (raceError || !race) return { error: "Erro ao registrar prova: " + raceError?.message };

  const path = `${user.id}/${race.id}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("comprovantes").upload(path, file);
  if (uploadError) return { error: "Erro ao enviar comprovante: " + uploadError.message };

  await supabase.from("attachments").insert({
    owner_id: profile.id,
    entity_type: "external_race",
    entity_id: race.id,
    file_url: path,
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
  });

  const requestsToCreate = [];
  if (usedCraRegistration && registrationType) {
    requestsToCreate.push({
      participant_id: profile.id,
      external_race_id: race.id,
      activity_type_id: registrationType.id,
      requested_points: 5,
      status: "submitted" as const,
    });
  }
  if (usedCraShirt && shirtType) {
    requestsToCreate.push({
      participant_id: profile.id,
      external_race_id: race.id,
      activity_type_id: shirtType.id,
      requested_points: 3,
      status: "submitted" as const,
    });
  }

  if (requestsToCreate.length > 0) {
    const { error: reqError } = await supabase.from("point_requests").insert(requestsToCreate);
    if (reqError) return { error: "Prova registrada, mas erro ao criar solicitação: " + reqError.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

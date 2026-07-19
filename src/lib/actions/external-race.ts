"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerExternalRace(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
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
  const { error: uploadError } = await supabase.storage
    .from("comprovantes")
    .upload(path, file);

  if (uploadError) return { error: "Erro ao enviar comprovante: " + uploadError.message };

  await supabase.from("attachments").insert({
    owner_id: profile.id,
    entity_type: "external_race",
    entity_id: race.id,
    file_url: path,
    file_name: file.name,
    mime_type: file.type,
    file_size: file.size,
  });

  revalidatePath("/extrato");
  return { success: true };
}

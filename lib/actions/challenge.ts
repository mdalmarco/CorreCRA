"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function joinChallenge() {
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

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!challenge) return { error: "Nenhum desafio ativo no momento." };

  const { error } = await supabase.from("challenge_participants").insert({
    participant_id: profile.id,
    challenge_id: challenge.id,
    status: "awaiting_payment",
    payment_status: "pending",
  });

  if (error) {
    if (error.code === "23505") return { error: "Você ja solicitou participação neste desafio." };
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/perfil");
  return { success: true };
}

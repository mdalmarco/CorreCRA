"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const shirtSize = String(formData.get("shirt_size") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      city: city || null,
      phone: phone || null,
      shirt_size: shirtSize || null,
      birth_date: birthDate || null,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/perfil");
  revalidatePath("/dashboard");
  return { success: true };
}

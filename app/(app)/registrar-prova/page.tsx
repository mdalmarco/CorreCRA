import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegistrarProvaForm } from "./registrar-prova-form";

export default async function RegistrarProvaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: enrollment } = await supabase
    .from("challenge_participants")
    .select("status, payment_status")
    .eq("participant_id", profile?.id ?? "")
    .eq("challenge_id", challenge?.id ?? "")
    .maybeSingle();

  const isVip = enrollment?.status === "active" && enrollment?.payment_status === "confirmed";

  if (!isVip) {
    return (
      <div className="mx-auto max-w-md space-y-3 p-4 pb-24 text-center">
        <h1 className="text-xl font-bold">Registrar prova externa</h1>
        <p className="text-sm text-neutral-500">
          Essa funcionalidade e exclusiva pra quem participa do {challenge?.name ?? "Desafio CRA 2026"}
          . Volte pro seu dashboard e participe do desafio pra desbloquear.
        </p>
        <Link href="/dashboard" className="inline-block rounded-lg bg-[#F5C518] px-5 py-2 font-semibold">
          Voltar ao dashboard
        </Link>
      </div>
    );
  }

  return <RegistrarProvaForm />;
}

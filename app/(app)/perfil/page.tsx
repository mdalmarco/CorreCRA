import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";
import { JoinChallengeButton } from "../dashboard/join-challenge-button";

const participantStatusLabel: Record<string, string> = {
  incomplete: "Cadastro incompleto",
  awaiting_payment: "Aguardando pagamento",
  active: "Ativo",
  suspended: "Suspenso",
  closed: "Encerrado",
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, name, registration_fee")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: enrollment } = await supabase
    .from("challenge_participants")
    .select("status, payment_status")
    .eq("participant_id", profile.id)
    .eq("challenge_id", challenge?.id ?? "")
    .maybeSingle();

  const isVip = enrollment?.status === "active" && enrollment?.payment_status === "confirmed";

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">Meu perfil</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{challenge?.name ?? "Desafio"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isVip ? (
            <div className="flex gap-2">
              <Badge className="bg-[#F5C518] text-black">VIP</Badge>
              <Badge>Pagamento confirmado</Badge>
            </div>
          ) : enrollment ? (
            <div className="flex gap-2">
              <Badge variant="secondary">
                {participantStatusLabel[enrollment.status] ?? enrollment.status}
              </Badge>
              <Badge variant="secondary">
                {enrollment.payment_status === "confirmed" ? "Pagamento confirmado" : "Pagamento pendente"}
              </Badge>
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-500">
                Sua conta e livre. Participe do desafio pra pontuar e entrar no ranking.
              </p>
              {challenge && <JoinChallengeButton fee={challenge.registration_fee} />}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-neutral-500">{profile.email}</p>
          <ProfileForm
            profile={{
              display_name: profile.display_name,
              city: profile.city,
              phone: profile.phone,
              shirt_size: profile.shirt_size,
              birth_date: profile.birth_date,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Termos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-500">
          {profile.terms_accepted_at ? (
            <p>
              Termos aceitos em{" "}
              {new Date(profile.terms_accepted_at).toLocaleDateString("pt-BR")}
              {profile.terms_version ? ` (v${profile.terms_version})` : ""}
            </p>
          ) : (
            <p>Termos ainda nao aceitos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

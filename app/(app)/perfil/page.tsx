import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";

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

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">Meu perfil</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Status da inscricao</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Badge variant={profile.payment_status === "confirmed" ? "default" : "secondary"}>
            {profile.payment_status === "confirmed" ? "Pagamento confirmado" : "Pagamento pendente"}
          </Badge>
          <Badge variant={profile.participant_status === "active" ? "default" : "secondary"}>
            {participantStatusLabel[profile.participant_status] ?? profile.participant_status}
          </Badge>
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

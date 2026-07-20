import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParticipantActions } from "./participant-actions";

const participantStatusLabel: Record<string, string> = {
  incomplete: "Cadastro incompleto",
  awaiting_payment: "Aguardando pagamento",
  active: "Ativo",
  suspended: "Suspenso",
  closed: "Encerrado",
};

export default async function ParticipantesOrgPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const { q } = await searchParams;

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let query = supabase
    .from("profiles")
    .select("id, full_name, city, role, participant_status, payment_status")
    .eq("role", "participant")
    .order("full_name", { ascending: true });

  if (q) {
    query = query.ilike("full_name", `%${q}%`);
  }

  const { data: participants } = await query;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Participantes</h1>
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </form>

      <div className="space-y-2">
        {(participants ?? []).map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{p.full_name}</span>
                <div className="flex gap-1">
                  <Badge variant={p.payment_status === "confirmed" ? "default" : "secondary"}>
                    {p.payment_status === "confirmed" ? "Pago" : "Pgto pendente"}
                  </Badge>
                  <Badge variant={p.participant_status === "active" ? "default" : "secondary"}>
                    {participantStatusLabel[p.participant_status] ?? p.participant_status}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-neutral-500">{p.city ?? "Sem cidade"}</p>
              <ParticipantActions
                participantId={p.id}
                challengeId={challenge?.id ?? ""}
                paymentStatus={p.payment_status}
                participantStatus={p.participant_status}
              />
            </CardContent>
          </Card>
        ))}
        {(participants ?? []).length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-neutral-400">
            Nenhum participante encontrado.
          </p>
        )}
      </div>
    </div>
  );
}

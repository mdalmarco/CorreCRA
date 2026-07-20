import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewButtons } from "./review-buttons";

interface PendingRequest {
  id: string;
  requested_points: number;
  participant_notes: string | null;
  created_at: string;
  profiles: { full_name: string; city: string | null } | null;
  activity_types: { name: string } | null;
  external_races: { name: string; race_date: string; official_url: string | null } | null;
}

export default async function ValidacoesPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("point_requests")
    .select(
      "id, requested_points, participant_notes, created_at, profiles!point_requests_participant_id_fkey(full_name, city), activity_types(name), external_races(name, race_date, official_url)"
    )
    .in("status", ["submitted", "in_review"])
    .order("created_at", { ascending: true });

  const pending = (requests ?? []) as unknown as PendingRequest[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Central de validacoes</h1>
        <Badge variant="secondary">{pending.length} pendente(s)</Badge>
      </div>

      {pending.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-neutral-400">
          Nenhuma solicitacao pendente.
        </p>
      )}

      <div className="space-y-3">
        {pending.map((req) => (
          <Card key={req.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{req.profiles?.full_name ?? "Participante"}</span>
                <Badge>{req.activity_types?.name ?? "Atividade"}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-neutral-500">
                {req.external_races?.name} — {req.external_races?.race_date} —{" "}
                {req.profiles?.city ?? "sem cidade"}
              </p>
              {req.external_races?.official_url && (
                <a
                  href={req.external_races.official_url}
                  target="_blank"
                  className="text-sm text-blue-600 underline"
                >
                  Link oficial da prova
                </a>
              )}
              <p className="text-sm">
                Solicitado: <strong>{req.requested_points} pts</strong>
              </p>
              <ReviewButtons requestId={req.id} requestedPoints={req.requested_points} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

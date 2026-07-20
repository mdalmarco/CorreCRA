import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateEventForm } from "./create-event-form";
import { CloseCheckinButton } from "./close-checkin-button";

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  checkin_open: "Check-in aberto",
  checkin_closed: "Check-in encerrado",
  completed: "Concluido",
  cancelled: "Cancelado",
};

export default async function EventosOrgPage() {
  const supabase = await createClient();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: activityTypes } = await supabase
    .from("activity_types")
    .select("id, name, default_points")
    .eq("challenge_id", challenge?.id ?? "")
    .eq("active", true);

  const { data: events } = await supabase
    .from("events")
    .select("id, name, city, status, start_at, checkin_code, points")
    .order("start_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Eventos</h1>
      <CreateEventForm activityTypes={activityTypes ?? []} />

      <div className="space-y-2">
        {(events ?? []).map((ev) => (
          <Card key={ev.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{ev.name}</span>
                <Badge variant={ev.status === "checkin_open" ? "default" : "secondary"}>
                  {statusLabel[ev.status] ?? ev.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-neutral-500">
              <div>
                <p>
                  {ev.city ?? "—"} — {new Date(ev.start_at).toLocaleString("pt-BR")}
                </p>
                <p>
                  Codigo: <strong>{ev.checkin_code}</strong> — {ev.points} pts
                </p>
              </div>
              {ev.status === "checkin_open" && <CloseCheckinButton eventId={ev.id} />}
            </CardContent>
          </Card>
        ))}
        {(events ?? []).length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-neutral-400">
            Nenhum evento criado ainda.
          </p>
        )}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  checkin_open: "Check-in aberto",
  checkin_closed: "Check-in encerrado",
  completed: "Concluido",
  cancelled: "Cancelado",
};

export default async function EventosPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, city, description, status, start_at, points")
    .in("status", ["scheduled", "checkin_open", "checkin_closed", "completed"])
    .order("start_at", { ascending: true });

  const now = Date.now();
  const upcoming = (events ?? []).filter((e) => new Date(e.start_at).getTime() >= now || e.status === "checkin_open");
  const past = (events ?? []).filter((e) => new Date(e.start_at).getTime() < now && e.status !== "checkin_open");

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-24">
      <h1 className="text-2xl font-bold">Eventos</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500">Proximos</h2>
        {upcoming.map((ev) => (
          <Card key={ev.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{ev.name}</span>
                <Badge variant={ev.status === "checkin_open" ? "default" : "secondary"}>
                  {statusLabel[ev.status] ?? ev.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-500">
              <p>
                {ev.city ?? "—"} — {new Date(ev.start_at).toLocaleString("pt-BR")}
              </p>
              {ev.description && <p className="mt-1">{ev.description}</p>}
              <p className="mt-1 font-medium text-neutral-700">{ev.points} pts</p>
            </CardContent>
          </Card>
        ))}
        {upcoming.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-neutral-400">
            Nenhum evento futuro no momento.
          </p>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-neutral-500">Historico</h2>
          {past.map((ev) => (
            <Card key={ev.id} className="opacity-60">
              <CardContent className="flex items-center justify-between py-3 text-sm">
                <span>{ev.name}</span>
                <span className="text-neutral-500">{new Date(ev.start_at).toLocaleDateString("pt-BR")}</span>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

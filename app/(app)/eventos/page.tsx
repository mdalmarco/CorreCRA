import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";

const cityGradient: Record<string, string> = {
  Blumenau: "from-[#F5C518]/25 to-[#0a0a0b]",
  Indaial: "from-[#B6FF3C]/20 to-[#0a0a0b]",
};

export default async function EventosPage() {
  const supabase = await createClient();

  const nowIso = new Date().toISOString();

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, name, city, description, status, start_at, points, location")
    .in("status", ["scheduled", "checkin_open"])
    .gte("start_at", nowIso)
    .order("start_at", { ascending: true })
    .limit(8);

  const { data: pastEvents } = await supabase
    .from("events")
    .select("id, name, city, start_at")
    .lt("start_at", nowIso)
    .order("start_at", { ascending: false })
    .limit(6);

  const eventIds = (upcomingEvents ?? []).map((e) => e.id);
  const attendanceCounts = new Map<string, number>();
  if (eventIds.length > 0) {
    const { data: attendance } = await supabase
      .from("event_attendance_view")
      .select("event_id")
      .in("event_id", eventIds);
    for (const a of attendance ?? []) {
      if (!a.event_id) continue;
      attendanceCounts.set(a.event_id, (attendanceCounts.get(a.event_id) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-28">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[#f5f5f0]">
        EVENTOS
      </h1>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6f6f78]">Proximos</h2>
        {(upcomingEvents ?? []).map((ev) => {
          const confirmed = attendanceCounts.get(ev.id) ?? 0;
          const gradient = cityGradient[ev.city ?? ""] ?? "from-[#2c2c32] to-[#0a0a0b]";
          return (
            <div key={ev.id} className="cra-glass overflow-hidden rounded-2xl">
              <div className={`bg-gradient-to-br ${gradient} px-4 pb-3 pt-5`}>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">
                  {new Date(ev.start_at).toLocaleDateString("pt-BR", { weekday: "long" })}
                </p>
                <p className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[#f5f5f0]">
                  {ev.name.toUpperCase()}
                </p>
              </div>
              <div className="space-y-2 px-4 pb-4">
                <div className="flex items-center gap-1.5 text-sm text-[#9a9aa2]">
                  <MapPin className="h-3.5 w-3.5" />
                  {ev.location ?? ev.city} —{" "}
                  {new Date(ev.start_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {ev.description && <p className="text-sm text-[#9a9aa2]">{ev.description}</p>}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#6f6f78]">
                    <Users className="h-3.5 w-3.5" />
                    {confirmed > 0 ? `${confirmed} ja confirmaram` : "Seja o primeiro"} · {ev.points} pts
                  </div>
                  <Link
                    href="/checkin"
                    className="rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-bold text-black"
                  >
                    Check-in
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {(upcomingEvents ?? []).length === 0 && (
          <p className="rounded-2xl border border-dashed border-[#2c2c32] p-6 text-center text-sm text-[#6f6f78]">
            Nenhum evento futuro no momento.
          </p>
        )}
      </section>

      {pastEvents && pastEvents.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6f6f78]">Historico</h2>
          {pastEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between rounded-xl border border-[#2c2c32] bg-[#17171a] px-4 py-2.5 opacity-70"
            >
              <span className="text-sm text-[#f5f5f0]">{ev.name}</span>
              <span className="text-xs text-[#6f6f78]">
                {new Date(ev.start_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

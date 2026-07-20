import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { Mascot } from "@/components/mascot";
import { getLevelProgress } from "@/lib/levels";

const CITY_FILTERS = ["Blumenau", "Indaial"];

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city: cityFilter } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myProfileId: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    myProfileId = profile?.id ?? null;
  }

  const { data: challenge } = await supabase
    .from("challenges")
    .select("tie_break_rules")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: rows } = await supabase
    .from("ranking_view")
    .select("*")
    .order("total_points", { ascending: false });

  const allRanked = (rows ?? []).slice().sort((a, b) => {
    if ((b.total_points ?? 0) !== (a.total_points ?? 0)) return (b.total_points ?? 0) - (a.total_points ?? 0);
    if ((b.cra_registrations ?? 0) !== (a.cra_registrations ?? 0))
      return (b.cra_registrations ?? 0) - (a.cra_registrations ?? 0);
    if ((b.cra_shirt_races ?? 0) !== (a.cra_shirt_races ?? 0))
      return (b.cra_shirt_races ?? 0) - (a.cra_shirt_races ?? 0);
    if ((b.weekly_runs ?? 0) !== (a.weekly_runs ?? 0)) return (b.weekly_runs ?? 0) - (a.weekly_runs ?? 0);
    if ((b.monthly_trainings ?? 0) !== (a.monthly_trainings ?? 0))
      return (b.monthly_trainings ?? 0) - (a.monthly_trainings ?? 0);
    return new Date(a.achieved_at ?? 0).getTime() - new Date(b.achieved_at ?? 0).getTime();
  });

  const ranked = cityFilter
    ? allRanked.filter((r) => (r.city ?? "").toLowerCase() === cityFilter.toLowerCase())
    : allRanked;

  const myIndex = myProfileId ? ranked.findIndex((r) => r.participant_id === myProfileId) : -1;
  const myRow = myIndex >= 0 ? ranked[myIndex] : null;
  const nextAbove = myIndex > 0 ? ranked[myIndex - 1] : null;
  const gapToNext = nextAbove ? (nextAbove.total_points ?? 0) - (myRow?.total_points ?? 0) : 0;

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  // ordem visual do podio: 2o, 1o, 3o
  const podiumOrder = [podium[1], podium[0], podium[2]];

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 pb-28">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[#f5f5f0]">
          RANKING
        </h1>
        <p className="text-xs text-[#6f6f78]">
          Desempate: {(challenge?.tie_break_rules as string[] | undefined)?.join(" > ") ?? "—"}
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href="/ranking"
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium",
            !cityFilter ? "bg-[#F5C518] text-black" : "border border-[#2c2c32] text-[#9a9aa2]"
          )}
        >
          Geral
        </Link>
        {CITY_FILTERS.map((c) => (
          <Link
            key={c}
            href={`/ranking?city=${encodeURIComponent(c)}`}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              cityFilter === c ? "bg-[#F5C518] text-black" : "border border-[#2c2c32] text-[#9a9aa2]"
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      {podium.length > 0 && (
        <div className="cra-glass rounded-3xl p-5">
          <div className="flex items-end justify-center gap-4">
            {podiumOrder.map((r, slot) => {
              if (!r) return <div key={slot} className="w-20" />;
              const place = slot === 1 ? 1 : slot === 0 ? 2 : 3;
              const height = place === 1 ? "h-28" : place === 2 ? "h-20" : "h-14";
              const ring = place === 1 ? "#F5C518" : place === 2 ? "#c9c9ce" : "#c9a227";
              const levelName = getLevelProgress(r.total_points ?? 0).levelName;
              return (
                <div key={r.participant_id} className="flex w-20 flex-col items-center gap-2">
                  <Mascot levelName={levelName} size={place === 1 ? 56 : 44} />
                  <p className="w-full truncate text-center text-xs font-medium text-[#f5f5f0]">
                    {r.full_name}
                  </p>
                  <p className="font-mono text-xs text-[#9a9aa2]">{r.total_points} pts</p>
                  <div
                    className={cn("flex w-full items-end justify-center rounded-t-lg", height)}
                    style={{ background: `linear-gradient(180deg, ${ring}33, ${ring}11)`, borderTop: `2px solid ${ring}` }}
                  >
                    <span
                      className="font-[family-name:var(--font-display)] text-2xl"
                      style={{ color: ring }}
                    >
                      {place}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {myRow && myIndex >= 3 && (
        <div className="rounded-2xl border-2 border-[#F5C518] bg-[#17171a] p-4">
          <p className="text-sm text-[#9a9aa2]">Sua posicao{cityFilter ? ` em ${cityFilter}` : ""}</p>
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[#F5C518]">
            {myIndex + 1}º lugar — {myRow.total_points} pts
          </p>
          {nextAbove && (
            <p className="mt-1 text-sm text-[#9a9aa2]">
              Faltam <strong className="text-[#f5f5f0]">{gapToNext} pts</strong> pra alcancar {nextAbove.full_name}{" "}
              ({myIndex}º lugar)
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        {rest.map((r, i) => (
          <div
            key={r.participant_id}
            className={cn(
              "flex items-center justify-between rounded-xl border border-[#2c2c32] bg-[#17171a] px-4 py-2.5",
              r.participant_id === myProfileId && "border-[#F5C518] bg-[#F5C518]/10"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-sm text-[#6f6f78]">{i + 4}</span>
              <span className="text-sm text-[#f5f5f0]">
                {r.full_name}
                {r.participant_id === myProfileId && <span className="ml-1 text-xs text-[#9a9aa2]">(voce)</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6f6f78]">{r.city ?? "—"}</span>
              <span className="font-mono text-sm font-bold text-[#f5f5f0]">{r.total_points}</span>
            </div>
          </div>
        ))}
        {ranked.length === 0 && (
          <p className="rounded-xl border border-dashed border-[#2c2c32] py-8 text-center text-sm text-[#6f6f78]">
            {cityFilter ? `Ninguem pontuou em ${cityFilter} ainda.` : "Ainda sem pontuacoes validadas."}
          </p>
        )}
      </div>
    </div>
  );
}

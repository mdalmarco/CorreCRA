import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  // ranking_view agrega point_ledger validado no banco (contorna a RLS restritiva
  // de point_ledger, que so permite leitura do proprio registro), ja trazendo os
  // contadores usados nos criterios de desempate oficiais do Desafio CRA 2026.
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

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="mb-1 text-2xl font-bold">Ranking</h1>
      <p className="mb-3 text-xs text-neutral-400">
        Desempate: {(challenge?.tie_break_rules as string[] | undefined)?.join(" > ") ?? "—"}
      </p>

      <div className="mb-4 flex gap-2">
        <Link
          href="/ranking"
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium",
            !cityFilter ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
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
              cityFilter === c ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      {myRow && (
        <div className="mb-4 rounded-lg border-2 border-[#F5C518] bg-neutral-950 p-4 text-white">
          <p className="text-sm text-neutral-300">
            Sua posicao{cityFilter ? ` em ${cityFilter}` : ""}
          </p>
          <p className="text-2xl font-bold text-[#F5C518]">
            {myIndex + 1}º lugar — {myRow.total_points} pts
          </p>
          {nextAbove ? (
            <p className="mt-1 text-sm text-neutral-300">
              Faltam <strong className="text-white">{gapToNext} pts</strong> pra alcancar{" "}
              {nextAbove.full_name} ({myIndex}º lugar)
            </p>
          ) : (
            <p className="mt-1 text-sm text-neutral-300">Voce esta na lideranca! 🏆</p>
          )}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead className="text-right">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranked.map((r, i) => (
            <TableRow
              key={r.participant_id}
              className={cn(r.participant_id === myProfileId && "bg-[#F5C518]/10")}
            >
              <TableCell className="font-medium">
                {i < 3 ? <Badge className="bg-[#F5C518] text-black">{i + 1}</Badge> : i + 1}
              </TableCell>
              <TableCell>
                {r.full_name}
                {r.participant_id === myProfileId && <span className="ml-1 text-xs text-neutral-400">(voce)</span>}
              </TableCell>
              <TableCell className="text-neutral-500">{r.city ?? "—"}</TableCell>
              <TableCell className="text-right font-bold">{r.total_points}</TableCell>
            </TableRow>
          ))}
          {ranked.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-neutral-400">
                {cityFilter ? `Ninguem pontuou em ${cityFilter} ainda.` : "Ainda sem pontuacoes validadas."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

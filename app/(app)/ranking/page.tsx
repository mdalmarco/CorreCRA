import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function RankingPage() {
  const supabase = await createClient();

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

  const ranked = (rows ?? []).slice().sort((a, b) => {
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

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="mb-1 text-2xl font-bold">Ranking</h1>
      <p className="mb-4 text-xs text-neutral-400">
        Desempate: {(challenge?.tie_break_rules as string[] | undefined)?.join(" > ") ?? "—"}
      </p>
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
            <TableRow key={r.participant_id}>
              <TableCell className="font-medium">
                {i < 3 ? <Badge className="bg-[#F5C518] text-black">{i + 1}</Badge> : i + 1}
              </TableCell>
              <TableCell>{r.full_name}</TableCell>
              <TableCell className="text-neutral-500">{r.city ?? "—"}</TableCell>
              <TableCell className="text-right font-bold">{r.total_points}</TableCell>
            </TableRow>
          ))}
          {ranked.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-neutral-400">
                Ainda sem pontuacoes validadas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

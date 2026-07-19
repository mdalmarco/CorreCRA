import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RankRow {
  participant_id: string;
  full_name: string;
  city: string | null;
  total_points: number;
}

export default async function RankingPage() {
  const supabase = await createClient();

  const { data: ledger } = await supabase
    .from("point_ledger")
    .select("participant_id, points, profiles!inner(full_name, city)")
    .eq("status", "validated");

  const totals = new Map<string, RankRow>();
  for (const row of (ledger ?? []) as unknown as Array<{
    participant_id: string;
    points: number;
    profiles: { full_name: string; city: string | null };
  }>) {
    const current = totals.get(row.participant_id);
    if (current) {
      current.total_points += row.points;
    } else {
      totals.set(row.participant_id, {
        participant_id: row.participant_id,
        full_name: row.profiles.full_name,
        city: row.profiles.city,
        total_points: row.points,
      });
    }
  }

  const ranked = Array.from(totals.values()).sort((a, b) => b.total_points - a.total_points);

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="mb-4 text-2xl font-bold">Ranking</h1>
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

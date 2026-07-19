import { createClient } from "@/lib/supabase/server";

export default async function RankingPage() {
  const supabase = await createClient();

  // Fonte oficial: soma de point_ledger validado por participante
  const { data: rows } = await supabase
    .from("point_ledger")
    .select("participant_id, points, profiles!inner(display_name, full_name, city)")
    .eq("status", "validated");

  const totals = new Map<string, { name: string; city: string | null; points: number }>();
  for (const row of rows ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const key = row.participant_id as string;
    const current = totals.get(key) ?? {
      name: profile?.display_name ?? profile?.full_name ?? "Atleta",
      city: profile?.city ?? null,
      points: 0,
    };
    current.points += Number(row.points);
    totals.set(key, current);
  }

  const ranking = Array.from(totals.values()).sort((a, b) => b.points - a.points);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">Ranking — Desafio CRA 2026</h1>
      <ol className="mt-6 divide-y rounded-xl border">
        {ranking.map((p, i) => (
          <li key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                  i < 3 ? "bg-cra-yellow" : "bg-neutral-100"
                }`}
              >
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{p.name}</p>
                {p.city && <p className="text-xs text-neutral-500">{p.city}</p>}
              </div>
            </div>
            <span className="font-bold">{p.points} pts</span>
          </li>
        ))}
        {ranking.length === 0 && (
          <li className="px-4 py-6 text-center text-neutral-500">
            Ainda não há pontuações validadas.
          </li>
        )}
      </ol>
    </main>
  );
}

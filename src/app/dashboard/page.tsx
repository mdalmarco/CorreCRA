import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: ledgerRows } = await supabase
    .from("point_ledger")
    .select("points, status")
    .eq("participant_id", profile?.id ?? "")
    .eq("status", "validada");

  const totalPoints = (ledgerRows ?? []).reduce((sum, r) => sum + Number(r.points), 0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">
        Olá, {profile?.display_name ?? profile?.full_name ?? "atleta"}
      </h1>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-neutral-500">Pontuação total</p>
          <p className="text-3xl font-bold">{totalPoints}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-neutral-500">Status</p>
          <p className="text-xl font-semibold capitalize">
            {profile?.participant_status?.replace("_", " ") ?? "—"}
          </p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <a href="/checkin" className="rounded-lg bg-cra-yellow px-5 py-3 font-semibold">
          Fazer check-in
        </a>
        <a href="/ranking" className="rounded-lg border px-5 py-3 font-semibold">
          Ver ranking
        </a>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  validated: "Validado",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
  admin_adjustment: "Ajuste administrativo",
};

export default async function ExtratoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: entries } = await supabase
    .from("point_ledger")
    .select("id, description, points, status, occurred_at")
    .eq("participant_id", profile?.id ?? "")
    .order("occurred_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">Meu extrato</h1>
      <div className="mt-6 divide-y rounded-xl border">
        {(entries ?? []).map((e) => (
          <div key={e.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">{e.description ?? "Lançamento"}</p>
              <p className="text-xs text-neutral-500">
                {new Date(e.occurred_at).toLocaleDateString("pt-BR")} ·{" "}
                {statusLabel[e.status] ?? e.status}
              </p>
            </div>
            <span
              className={`font-bold ${e.status === "validated" ? "text-green-700" : "text-neutral-400"}`}
            >
              +{e.points}
            </span>
          </div>
        ))}
        {(entries ?? []).length === 0 && (
          <p className="px-4 py-6 text-center text-neutral-500">
            Nenhum lançamento ainda. Faça um check-in ou registre uma prova.
          </p>
        )}
      </div>
    </main>
  );
}

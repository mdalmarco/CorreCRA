import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: ledger } = await supabase
    .from("point_ledger")
    .select("points, status")
    .eq("participant_id", profile?.id ?? "")
    .eq("status", "validated");

  const totalPoints = (ledger ?? []).reduce((sum: number, l: { points: number }) => sum + l.points, 0);

  const { data: pendingRequests } = await supabase
    .from("point_requests")
    .select("id")
    .eq("participant_id", profile?.id ?? "")
    .in("status", ["submitted", "in_review", "complement_requested"]);

  const { data: nextEvent } = await supabase
    .from("events")
    .select("name, city, start_at")
    .eq("status", "scheduled")
    .order("start_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-24">
      <div>
        <p className="text-sm text-neutral-500">Ola,</p>
        <h1 className="text-2xl font-bold">{profile?.display_name ?? profile?.full_name ?? "Participante"}</h1>
      </div>

      <Card className="border-2 border-[#F5C518] bg-neutral-950 text-white">
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-neutral-300">Pontuacao total</p>
            <p className="text-4xl font-bold text-[#F5C518]">{totalPoints}</p>
          </div>
          {pendingRequests && pendingRequests.length > 0 && (
            <Badge variant="secondary">{pendingRequests.length} pendente(s)</Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          render={<Link href="/checkin" />}
          size="lg"
          className="h-16 bg-[#F5C518] text-black hover:bg-[#e0b310]"
        >
          Fazer check-in
        </Button>
        <Button render={<Link href="/registrar-prova" />} size="lg" variant="outline" className="h-16">
          Registrar prova
        </Button>
      </div>

      {nextEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proximo evento CRA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{nextEvent.name}</p>
            <p className="text-sm text-neutral-500">
              {nextEvent.city} — {new Date(nextEvent.start_at).toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 text-center">
        <Link href="/ranking" className="rounded-lg border p-4 hover:bg-neutral-50">
          <p className="text-sm text-neutral-500">Ranking</p>
        </Link>
        <Link href="/eventos" className="rounded-lg border p-4 hover:bg-neutral-50">
          <p className="text-sm text-neutral-500">Eventos</p>
        </Link>
      </div>
    </div>
  );
}

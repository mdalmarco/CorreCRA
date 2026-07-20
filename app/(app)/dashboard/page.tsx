import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { JoinChallengeButton } from "./join-challenge-button";
import { getLevelProgress } from "@/lib/levels";

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

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, name, registration_fee")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: enrollment } = await supabase
    .from("challenge_participants")
    .select("status, payment_status")
    .eq("participant_id", profile?.id ?? "")
    .eq("challenge_id", challenge?.id ?? "")
    .maybeSingle();

  const isVip = enrollment?.status === "active" && enrollment?.payment_status === "confirmed";
  const isAwaitingPayment = enrollment && !isVip;

  const { data: ledger } = await supabase
    .from("point_ledger")
    .select("points, status")
    .eq("participant_id", profile?.id ?? "")
    .eq("status", "validated");

  const totalPoints = (ledger ?? []).reduce((sum: number, l: { points: number }) => sum + l.points, 0);
  const level = getLevelProgress(totalPoints);

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Ola,</p>
          <h1 className="text-2xl font-bold">{profile?.display_name ?? profile?.full_name ?? "Participante"}</h1>
        </div>
        {isVip && <Badge className="bg-[#F5C518] text-black">VIP</Badge>}
      </div>

      {(profile?.role === "organizer" || profile?.role === "admin") && (
        <Link
          href="/organizador/validacoes"
          className="block rounded-lg border-2 border-neutral-900 bg-neutral-900 p-3 text-center text-sm font-medium text-white"
        >
          Abrir painel do organizador
        </Link>
      )}

      <Card className="border-2 border-[#F5C518] bg-neutral-950 text-white">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-neutral-300">Pontuacao total</p>
                {isVip && <Badge variant="secondary">{level.levelName}</Badge>}
              </div>
              <p className="text-4xl font-bold text-[#F5C518]">{totalPoints}</p>
            </div>
            {pendingRequests && pendingRequests.length > 0 && (
              <Badge variant="secondary">{pendingRequests.length} pendente(s)</Badge>
            )}
          </div>

          {isVip && level.nextLevelName && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-[#F5C518]"
                  style={{ width: `${level.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-neutral-400">
                Faltam {level.pointsToNext} pts pra virar {level.nextLevelName}
              </p>
            </div>
          )}
          {isVip && !level.nextLevelName && (
            <p className="text-xs text-neutral-400">Nivel maximo alcancado — voce e Diamante! 💎</p>
          )}

          {!isVip && !isAwaitingPayment && challenge && (
            <JoinChallengeButton fee={challenge.registration_fee} />
          )}
          {isAwaitingPayment && (
            <p className="text-sm text-neutral-300">
              Aguardando confirmacao do pagamento pelo organizador para virar VIP e comecar a
              pontuar no {challenge?.name}.
            </p>
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
        {isVip ? (
          <Button render={<Link href="/registrar-prova" />} size="lg" variant="outline" className="h-16">
            Registrar prova
          </Button>
        ) : (
          <Button size="lg" variant="outline" className="h-16" disabled>
            Registrar prova (VIP)
          </Button>
        )}
      </div>

      {!isVip && (
        <p className="text-center text-xs text-neutral-400">
          Check-in nos corres e treinoes e livre pra qualquer cadastrado — mas so pontua e entra
          no ranking quem for VIP do Desafio CRA 2026.
        </p>
      )}

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

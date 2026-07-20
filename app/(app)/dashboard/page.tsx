import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { JoinChallengeButton } from "./join-challenge-button";
import { getLevelProgress } from "@/lib/levels";
import { computeWeeklyStreak, countThisWeek, weeklyPointsSeries } from "@/lib/streak";
import { computeBadges } from "@/lib/badges";
import { Mascot } from "@/components/mascot";
import { EvolutionChart } from "@/components/evolution-chart";
import { Trophy, Flame, ChevronRight, ScanLine } from "lucide-react";

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
    .select("points, status, occurred_at, activity_types(name)")
    .eq("participant_id", profile?.id ?? "")
    .eq("status", "validated");

  const totalPoints = (ledger ?? []).reduce((sum: number, l) => sum + Number(l.points), 0);
  const level = getLevelProgress(totalPoints);

  const { data: pendingRequests } = await supabase
    .from("point_requests")
    .select("id")
    .eq("participant_id", profile?.id ?? "")
    .in("status", ["submitted", "in_review", "complement_requested"]);

  const { data: allCheckins } = await supabase
    .from("event_checkins")
    .select("checked_in_at, events!inner(activity_types(name))")
    .eq("participant_id", profile?.id ?? "")
    .eq("status", "valid");

  function activityName(c: { events: unknown }): string {
    const at = Array.isArray(c.events)
      ? (c.events[0] as { activity_types?: unknown })?.activity_types
      : (c.events as { activity_types?: unknown })?.activity_types;
    const a = Array.isArray(at) ? at[0] : at;
    return (a as { name?: string })?.name ?? "";
  }

  const weeklyRunDates = (allCheckins ?? [])
    .filter((c) => activityName(c) === "Corre semanal")
    .map((c) => c.checked_in_at);
  const streak = computeWeeklyStreak(weeklyRunDates);

  const WEEKLY_MISSION_TARGET = 3;
  const checkinsThisWeek = countThisWeek((allCheckins ?? []).map((c) => c.checked_in_at));
  const weeklyMissionDone = Math.min(checkinsThisWeek, WEEKLY_MISSION_TARGET);

  const evolutionData = weeklyPointsSeries(
    (ledger ?? []).map((l) => ({ points: Number(l.points), occurred_at: l.occurred_at })),
    6
  );
  const xpThisWeek = evolutionData[evolutionData.length - 1]?.points ?? 0;

  const badges = computeBadges({
    checkinActivityNames: (allCheckins ?? []).map(activityName),
    ledgerActivityNames: (ledger ?? []).map((l) => {
      const at = Array.isArray(l.activity_types) ? l.activity_types[0] : l.activity_types;
      return at?.name ?? "";
    }),
    weeklyStreak: streak,
  });
  const recentBadges = badges.filter((b) => b.earned).slice(-4);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const { data: todaysEvent } = await supabase
    .from("events")
    .select("id, name, city, start_at, location")
    .eq("status", "checkin_open")
    .gte("start_at", todayStart.toISOString())
    .lte("start_at", todayEnd.toISOString())
    .order("start_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let attendeeNames: string[] = [];
  let attendeeCount = 0;
  if (todaysEvent) {
    const { data: attendance } = await supabase
      .from("event_attendance_view")
      .select("full_name")
      .eq("event_id", todaysEvent.id);
    attendeeCount = attendance?.length ?? 0;
    attendeeNames = (attendance ?? []).slice(0, 4).map((a) => a.full_name ?? "").filter(Boolean);
  }

  const { data: rankingRows } = await supabase
    .from("ranking_view")
    .select("participant_id, full_name, total_points")
    .order("total_points", { ascending: false })
    .limit(3);

  const missionText = todaysEvent
    ? `Hoje tem corre em ${todaysEvent.city}. Faca check-in e some pontos.`
    : isVip
      ? `Faltam ${level.pointsToNext || "poucos"} pts pro nivel ${level.nextLevelName ?? "maximo"}.`
      : "Participe do desafio pra comecar a subir de nivel.";

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 pb-28">
      {/* Saudacao + streak */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-sm text-[#9a9aa2]">Ola,</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[#f5f5f0]">
            {(profile?.display_name ?? profile?.full_name ?? "atleta").toUpperCase()} 👋
          </h1>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full border border-[#2c2c32] bg-[#17171a] px-3 py-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-bold text-[#f5f5f0]">{streak}</span>
          </div>
        )}
      </div>

      {(profile?.role === "organizer" || profile?.role === "admin") && (
        <Link
          href="/organizador/validacoes"
          className="block rounded-xl border border-[#2c2c32] bg-[#17171a] p-3 text-center text-sm font-medium text-[#f5f5f0]"
        >
          Abrir painel do organizador
        </Link>
      )}

      {/* Temporada */}
      {challenge && (
        <p className="text-center text-[11px] uppercase tracking-widest text-[#6f6f78]">
          Temporada 1 — {challenge.name}
        </p>
      )}

      {/* Medalhao de nivel */}
      <div className="cra-glass relative overflow-hidden rounded-3xl p-6">
        <div className="cra-medallion-glow pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-5">
          <Mascot levelName={isVip ? level.levelName : "Iniciante"} size={88} />
          <div className="flex-1 space-y-2">
            <p className="font-[family-name:var(--font-display)] text-xl tracking-wide text-[#c9a227]">
              {isVip ? level.levelName.toUpperCase() : "SEM DESAFIO"}
            </p>
            <p className="font-[family-name:var(--font-display)] text-3xl leading-none text-[#f5c518]">
              {totalPoints} pts
            </p>
            {isVip && level.nextLevelName && (
              <>
                <div className="h-2 overflow-hidden rounded-full bg-[#2c2c32]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#c9a227] to-[#f5c518]"
                    style={{ width: `${level.progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-[#9a9aa2]">
                  Voce esta quase chegando a {level.nextLevelName}
                </p>
              </>
            )}
            {isVip && !level.nextLevelName && (
              <p className="text-xs text-[#9a9aa2]">Seu guepardo evoluiu ao maximo — Diamante 💎</p>
            )}
            {!isVip && !isAwaitingPayment && challenge && <JoinChallengeButton fee={challenge.registration_fee} />}
            {isAwaitingPayment && (
              <p className="text-xs text-[#9a9aa2]">Aguardando confirmacao do organizador pra virar VIP.</p>
            )}
          </div>
        </div>
        {pendingRequests && pendingRequests.length > 0 && (
          <p className="relative mt-3 text-xs text-[#9a9aa2]">
            {pendingRequests.length} solicitacao(oes) em analise
          </p>
        )}
      </div>

      {/* Missao do dia */}
      <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Missao de hoje</p>
        <p className="mt-1 text-sm text-[#f5f5f0]">{missionText}</p>
      </div>

      {/* Missao da semana */}
      {isVip && (
        <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">
              Missao da semana
            </p>
            <span className="text-xs text-[#9a9aa2]">
              {weeklyMissionDone}/{WEEKLY_MISSION_TARGET}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#f5f5f0]">
            Faca check-in {WEEKLY_MISSION_TARGET} vezes esta semana
          </p>
          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: WEEKLY_MISSION_TARGET }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < weeklyMissionDone ? "bg-[#B6FF3C]" : "bg-[#2c2c32]"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Corre de hoje */}
      {todaysEvent ? (
        <div className="cra-glass rounded-2xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg tracking-wide text-[#f5f5f0]">
                {todaysEvent.name.toUpperCase()}
              </p>
              <p className="text-sm text-[#9a9aa2]">
                {new Date(todaysEvent.start_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {" — "}
                {todaysEvent.location ?? todaysEvent.city}
              </p>
            </div>
            <ScanLine className="h-5 w-5 text-[#F5C518]" />
          </div>
          {attendeeCount > 0 && (
            <p className="mt-2 text-xs text-[#9a9aa2]">
              {attendeeNames.length > 0 ? attendeeNames.join(", ") : "Alguns CRAs"} ja confirmaram
              {attendeeCount > attendeeNames.length ? ` +${attendeeCount - attendeeNames.length}` : ""}
            </p>
          )}
          <Link
            href="/checkin"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#F5C518] py-3 text-sm font-bold text-black"
          >
            Fazer check-in
          </Link>
        </div>
      ) : (
        <Link
          href="/checkin"
          className="flex items-center justify-between rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4 text-sm font-medium text-[#f5f5f0]"
        >
          Fazer check-in
          <ChevronRight className="h-4 w-4 text-[#9a9aa2]" />
        </Link>
      )}

      {isVip ? (
        <Link
          href="/registrar-prova"
          className="flex items-center justify-between rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4 text-sm font-medium text-[#f5f5f0]"
        >
          Registrar prova externa
          <ChevronRight className="h-4 w-4 text-[#9a9aa2]" />
        </Link>
      ) : (
        <p className="text-center text-xs text-[#6f6f78]">
          Check-in e livre pra qualquer cadastrado — so pontua e entra no ranking quem for VIP.
        </p>
      )}

      {/* Sua evolucao */}
      {isVip && (
        <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#f5f5f0]">Sua evolucao</p>
            <span className="font-mono text-sm text-[#B6FF3C]">+{xpThisWeek} pts esta semana</span>
          </div>
          <EvolutionChart data={evolutionData} />
        </div>
      )}

      {/* Ranking mini */}
      {rankingRows && rankingRows.length > 0 && (
        <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[#f5f5f0]">
              <Trophy className="h-4 w-4 text-[#F5C518]" /> Ranking
            </p>
            <Link href="/ranking" className="text-xs text-[#9a9aa2]">
              ver tudo
            </Link>
          </div>
          <div className="space-y-2">
            {rankingRows.map((r, i) => (
              <div key={r.participant_id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={
                      i === 0
                        ? "text-[#f5c518]"
                        : i === 1
                          ? "text-[#c9c9ce]"
                          : "text-[#c9a227]"
                    }
                  >
                    {i + 1}º
                  </span>
                  <span className="text-[#f5f5f0]">{r.full_name}</span>
                </span>
                <span className="font-mono text-[#9a9aa2]">{r.total_points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conquistas recentes */}
      {recentBadges.length > 0 && (
        <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4">
          <p className="mb-3 text-sm font-semibold text-[#f5f5f0]">Conquistas recentes</p>
          <div className="flex gap-3">
            {recentBadges.map((b) => (
              <div key={b.id} className="flex flex-col items-center gap-1">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c9a227]/50 bg-[#c9a227]/10 text-xl">
                  {b.emoji}
                </span>
                <span className="w-16 text-center text-[10px] text-[#9a9aa2]">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/eventos"
        className="flex items-center justify-between rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4 text-sm font-medium text-[#f5f5f0]"
      >
        Ver todos os eventos
        <ChevronRight className="h-4 w-4 text-[#9a9aa2]" />
      </Link>
    </div>
  );
}

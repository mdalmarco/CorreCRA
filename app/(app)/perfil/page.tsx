import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { JoinChallengeButton } from "../dashboard/join-challenge-button";
import { computeBadges } from "@/lib/badges";
import { computeWeeklyStreak } from "@/lib/streak";
import { getLevelProgress } from "@/lib/levels";
import { Mascot } from "@/components/mascot";
import { Flame } from "lucide-react";

const participantStatusLabel: Record<string, string> = {
  incomplete: "Cadastro incompleto",
  awaiting_payment: "Aguardando pagamento",
  active: "Ativo",
  suspended: "Suspenso",
  closed: "Encerrado",
};

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  validated: "Validado",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
  admin_adjustment: "Ajuste administrativo",
};

export default async function PerfilPage() {
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

  if (!profile) redirect("/login");

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, name, registration_fee")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: enrollment } = await supabase
    .from("challenge_participants")
    .select("status, payment_status")
    .eq("participant_id", profile.id)
    .eq("challenge_id", challenge?.id ?? "")
    .maybeSingle();

  const isVip = enrollment?.status === "active" && enrollment?.payment_status === "confirmed";

  const { data: checkins } = await supabase
    .from("event_checkins")
    .select("checked_in_at, events!inner(activity_types(name))")
    .eq("participant_id", profile.id)
    .eq("status", "valid");

  const { data: ledgerEntries } = await supabase
    .from("point_ledger")
    .select("id, points, status, description, occurred_at, activity_types(name)")
    .eq("participant_id", profile.id)
    .order("occurred_at", { ascending: false });

  function activityName(c: { events?: unknown; activity_types?: unknown }): string {
    const raw = c.events ?? c.activity_types;
    const at = Array.isArray(raw)
      ? (raw[0] as { activity_types?: unknown })?.activity_types ?? raw[0]
      : (raw as { activity_types?: unknown })?.activity_types ?? raw;
    const a = Array.isArray(at) ? at[0] : at;
    return (a as { name?: string })?.name ?? "";
  }

  const weeklyStreak = computeWeeklyStreak(
    (checkins ?? []).filter((c) => activityName(c) === "Corre semanal").map((c) => c.checked_in_at)
  );

  const totalPoints = (ledgerEntries ?? [])
    .filter((l) => l.status === "validated")
    .reduce((sum, l) => sum + Number(l.points), 0);
  const level = getLevelProgress(totalPoints);

  const badges = computeBadges({
    checkinActivityNames: (checkins ?? []).map(activityName),
    ledgerActivityNames: (ledgerEntries ?? []).map((l) => activityName(l)),
    weeklyStreak,
  });
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  return (
    <div className="mx-auto max-w-lg space-y-5 p-4 pb-28">
      {/* Vitrine */}
      <div className="cra-glass relative overflow-hidden rounded-3xl p-6 text-center">
        <div className="cra-medallion-glow pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col items-center gap-2">
          <Mascot levelName={isVip ? level.levelName : "Iniciante"} size={96} />
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[#f5f5f0]">
            {(profile.display_name ?? profile.full_name).toUpperCase()}
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#c9a227]">
            {isVip ? level.levelName : "Sem desafio ativo"}
          </p>
          <div className="mt-1 flex items-center gap-4 text-sm">
            <span className="font-mono text-[#f5c518]">{totalPoints} pts</span>
            {weeklyStreak > 0 && (
              <span className="flex items-center gap-1 text-orange-400">
                <Flame className="h-4 w-4" /> {weeklyStreak}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Temporada / desafio */}
      <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4">
        <p className="text-xs uppercase tracking-widest text-[#6f6f78]">Temporada 1</p>
        <p className="mb-2 text-sm font-medium text-[#f5f5f0]">{challenge?.name ?? "Desafio"}</p>
        {isVip ? (
          <div className="flex gap-2">
            <span className="rounded-full bg-[#F5C518] px-2 py-0.5 text-xs font-bold text-black">VIP</span>
            <span className="rounded-full border border-[#2c2c32] px-2 py-0.5 text-xs text-[#9a9aa2]">
              Pagamento confirmado
            </span>
          </div>
        ) : enrollment ? (
          <div className="flex gap-2">
            <span className="rounded-full border border-[#2c2c32] px-2 py-0.5 text-xs text-[#9a9aa2]">
              {participantStatusLabel[enrollment.status] ?? enrollment.status}
            </span>
            <span className="rounded-full border border-[#2c2c32] px-2 py-0.5 text-xs text-[#9a9aa2]">
              {enrollment.payment_status === "confirmed" ? "Pagamento confirmado" : "Pagamento pendente"}
            </span>
          </div>
        ) : (
          <>
            <p className="mb-2 text-sm text-[#9a9aa2]">
              Sua conta e livre. Participe do desafio pra pontuar e entrar no ranking.
            </p>
            {challenge && <JoinChallengeButton fee={challenge.registration_fee} />}
          </>
        )}
      </div>

      {/* Conquistas */}
      <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4">
        <p className="mb-3 text-sm font-semibold text-[#f5f5f0]">
          Conquistas ({earnedBadges.length}/{badges.length})
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[...earnedBadges, ...lockedBadges].map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full border text-2xl ${
                  b.earned
                    ? "border-[#c9a227] bg-[#c9a227]/10"
                    : "border-[#2c2c32] bg-[#0a0a0b] opacity-30 grayscale"
                }`}
              >
                {b.emoji}
              </span>
              <span className="text-center text-[9px] leading-tight text-[#9a9aa2]">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Linha do tempo */}
      <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4">
        <p className="mb-3 text-sm font-semibold text-[#f5f5f0]">Historico</p>
        <div className="space-y-2">
          {(ledgerEntries ?? []).slice(0, 8).map((l) => (
            <div key={l.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-[#f5f5f0]">{l.description ?? "Lancamento"}</p>
                <p className="text-xs text-[#6f6f78]">
                  {new Date(l.occurred_at).toLocaleDateString("pt-BR")} ·{" "}
                  {statusLabel[l.status] ?? l.status}
                </p>
              </div>
              <span
                className={`font-mono font-bold ${l.status === "validated" ? "text-[#B6FF3C]" : "text-[#6f6f78]"}`}
              >
                +{l.points}
              </span>
            </div>
          ))}
          {(ledgerEntries ?? []).length === 0 && (
            <p className="text-center text-sm text-[#6f6f78]">Nenhum lancamento ainda.</p>
          )}
        </div>
      </div>

      {/* Dados pessoais */}
      <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4">
        <p className="mb-1 text-sm font-semibold text-[#f5f5f0]">Dados pessoais</p>
        <p className="mb-3 text-xs text-[#6f6f78]">{profile.email}</p>
        <ProfileForm
          profile={{
            display_name: profile.display_name,
            city: profile.city,
            phone: profile.phone,
            shirt_size: profile.shirt_size,
            birth_date: profile.birth_date,
          }}
        />
      </div>

      {/* Termos */}
      <div className="rounded-2xl border border-[#2c2c32] bg-[#17171a] p-4 text-sm text-[#9a9aa2]">
        {profile.terms_accepted_at ? (
          <p>
            Termos aceitos em {new Date(profile.terms_accepted_at).toLocaleDateString("pt-BR")}
            {profile.terms_version ? ` (v${profile.terms_version})` : ""}
          </p>
        ) : (
          <p>Termos ainda nao aceitos.</p>
        )}
      </div>
    </div>
  );
}

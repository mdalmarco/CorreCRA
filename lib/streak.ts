// Streak de semanas consecutivas com check-in em corre semanal.
// Semana = segunda a domingo (padrao ISO), no fuso America/Sao_Paulo.

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // domingo vira 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // quinta da mesma semana
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function countThisWeek(dates: string[]): number {
  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return dates.filter((d) => {
    const t = new Date(d).getTime();
    return t >= start.getTime() && t < end.getTime();
  }).length;
}

export interface WeeklyPoint {
  label: string;
  points: number;
}

export function weeklyPointsSeries(
  entries: { points: number; occurred_at: string }[],
  weeks = 6
): WeeklyPoint[] {
  const starts: Date[] = [];
  const cursor = startOfWeek(new Date());
  for (let i = weeks - 1; i >= 0; i--) {
    const s = new Date(cursor);
    s.setDate(s.getDate() - i * 7);
    starts.push(s);
  }

  return starts.map((s) => {
    const e = new Date(s);
    e.setDate(e.getDate() + 7);
    const points = entries
      .filter((entry) => {
        const t = new Date(entry.occurred_at).getTime();
        return t >= s.getTime() && t < e.getTime();
      })
      .reduce((sum, entry) => sum + Number(entry.points), 0);
    return { label: `${s.getDate()}/${s.getMonth() + 1}`, points };
  });
}

export function computeWeeklyStreak(checkinDates: string[]): number {
  if (checkinDates.length === 0) return 0;

  const weekSet = new Set(checkinDates.map((d) => isoWeekKey(new Date(d))));

  const now = new Date();
  const cursor = startOfWeek(now);

  // se a semana atual ainda não teve check-in, comeca a contar da semana passada
  // (a atual ainda "esta valendo", so não entra na contagem se vazia)
  if (!weekSet.has(isoWeekKey(cursor))) {
    cursor.setDate(cursor.getDate() - 7);
  }

  let streak = 0;
  while (weekSet.has(isoWeekKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }

  return streak;
}

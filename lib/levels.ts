// Niveis de participacao do Desafio CRA 2026 (regra 12 do prompt original).
// Configuravel no futuro; por enquanto fixo aqui.
export const LEVELS = [
  { name: "Iniciante", min: 0 },
  { name: "Bronze", min: 20 },
  { name: "Prata", min: 40 },
  { name: "Ouro", min: 70 },
  { name: "Diamante", min: 100 },
] as const;

export function getLevelProgress(points: number) {
  let currentIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) currentIndex = i;
  }
  const current = LEVELS[currentIndex];
  const next = LEVELS[currentIndex + 1] ?? null;

  if (!next) {
    return {
      levelName: current.name,
      nextLevelName: null as string | null,
      pointsToNext: 0,
      progressPercent: 100,
    };
  }

  const range = next.min - current.min;
  const progress = points - current.min;
  return {
    levelName: current.name,
    nextLevelName: next.name,
    pointsToNext: next.min - points,
    progressPercent: Math.min(100, Math.round((progress / range) * 100)),
  };
}

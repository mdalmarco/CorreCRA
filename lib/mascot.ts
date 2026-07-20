// O mascote do CRA e um guepardo — reaproveita o sistema de niveis existente
// como "evolucao" (sem tabela nova: o guepardo evolui junto com o nivel real).

export interface MascotStyle {
  emoji: string;
  filter: string;
  ringColor: string;
  glow: string;
  crown: boolean;
}

const STYLES: Record<string, MascotStyle> = {
  Iniciante: {
    emoji: "🐆",
    filter: "grayscale(100%) opacity(0.6)",
    ringColor: "#4a4a52",
    glow: "none",
    crown: false,
  },
  Bronze: {
    emoji: "🐆",
    filter: "sepia(60%) saturate(150%) hue-rotate(-10deg)",
    ringColor: "#a97142",
    glow: "0 0 16px rgba(169,113,66,0.35)",
    crown: false,
  },
  Prata: {
    emoji: "🐆",
    filter: "grayscale(40%) contrast(110%) brightness(1.1)",
    ringColor: "#c9c9ce",
    glow: "0 0 18px rgba(201,201,206,0.4)",
    crown: false,
  },
  Ouro: {
    emoji: "🐆",
    filter: "saturate(140%) brightness(1.05)",
    ringColor: "#c9a227",
    glow: "0 0 22px rgba(201,162,39,0.5)",
    crown: false,
  },
  Diamante: {
    emoji: "🐆",
    filter: "saturate(160%) brightness(1.15) contrast(105%)",
    ringColor: "#B6FF3C",
    glow: "0 0 28px rgba(182,255,60,0.55)",
    crown: true,
  },
};

export function getMascotStyle(levelName: string): MascotStyle {
  return STYLES[levelName] ?? STYLES.Iniciante;
}

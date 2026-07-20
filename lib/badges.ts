// Conquistas do Desafio CRA 2026 (secao 12 do prompt original).
// Calculadas em tempo real a partir dos dados reais — sem tabela propria,
// pra nunca ficar dessincronizado se uma regra mudar.

export interface BadgeInput {
  checkinActivityNames: string[]; // uma entrada por check-in valido, nome do activity_type
  ledgerActivityNames: string[]; // uma entrada por lancamento validado no point_ledger, nome do activity_type
  weeklyStreak: number;
}

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  category: "Presenca" | "Sequencia" | "Treinos" | "Provas";
  earned: boolean;
}

export function computeBadges(input: BadgeInput): Badge[] {
  const totalCheckins = input.checkinActivityNames.length;
  const weeklyRunCheckins = input.checkinActivityNames.filter((n) => n === "Corre semanal").length;
  const monthlyTrainingCheckins = input.checkinActivityNames.filter((n) => n === "Treinao mensal").length;
  const craRegistrations = input.ledgerActivityNames.filter(
    (n) => n === "Inscricao em prova como equipe CRA"
  ).length;
  const craShirtRaces = input.ledgerActivityNames.filter((n) => n === "Prova com camisa CRA").length;

  return [
    {
      id: "primeira-participacao",
      label: "Primeira participacao",
      emoji: "🎉",
      category: "Presenca",
      earned: totalCheckins >= 1,
    },
    {
      id: "dez-atividades",
      label: "10 atividades",
      emoji: "⭐",
      category: "Presenca",
      earned: totalCheckins >= 10,
    },
    {
      id: "primeiro-corre",
      label: "Primeiro corre semanal",
      emoji: "🏃",
      category: "Sequencia",
      earned: weeklyRunCheckins >= 1,
    },
    {
      id: "quatro-semanas",
      label: "4 semanas consecutivas",
      emoji: "🔥",
      category: "Sequencia",
      earned: input.weeklyStreak >= 4,
    },
    {
      id: "primeiro-treinao",
      label: "Primeiro treinao",
      emoji: "💪",
      category: "Treinos",
      earned: monthlyTrainingCheckins >= 1,
    },
    {
      id: "primeira-prova-cra",
      label: "Primeira prova como CRA",
      emoji: "🏅",
      category: "Provas",
      earned: craRegistrations >= 1 || craShirtRaces >= 1,
    },
    {
      id: "representante-cra",
      label: "Representante CRA",
      emoji: "🟡",
      category: "Provas",
      earned: craRegistrations >= 3,
    },
  ];
}

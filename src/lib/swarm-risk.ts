export type SwarmRiskLevel = "low" | "moderate" | "high";

export type SwarmRiskInput = {
  month: number;
  queenCellsSeen: boolean;
  honeyStores?: string | null;
};

export function isSwarmSeason(month: number): boolean {
  return month >= 2 && month <= 4;
}

export function scoreSwarmRisk(input: SwarmRiskInput): SwarmRiskLevel {
  let score = 0;
  if (isSwarmSeason(input.month)) score += 2;
  if (input.queenCellsSeen) score += 3;
  if (input.honeyStores === "full" || input.honeyStores === "good") score += 1;
  if (score >= 4) return "high";
  if (score >= 2) return "moderate";
  return "low";
}

export function swarmRiskMessage(level: SwarmRiskLevel): string {
  switch (level) {
    case "high":
      return "High swarm risk — queen cells or peak swarm season";
    case "moderate":
      return "Moderate swarm risk — watch space and queen cells";
    default:
      return "Low swarm risk";
  }
}

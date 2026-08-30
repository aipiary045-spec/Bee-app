export type SeasonSnapshotInput = {
  inspectionCount: number;
  treatmentCount: number;
  splitCount: number;
  harvestLbs: number;
  miteReadings: number[];
};

export type SeasonSnapshot = {
  year: number;
  inspectionCount: number;
  treatmentCount: number;
  splitCount: number;
  harvestLbs: number;
  avgMitePer100: number | null;
};

export function buildSeasonSnapshot(
  input: SeasonSnapshotInput,
  year: number = new Date().getFullYear()
): SeasonSnapshot {
  const avgMitePer100 =
    input.miteReadings.length > 0
      ? Math.round(
          (input.miteReadings.reduce((sum, value) => sum + value, 0) /
            input.miteReadings.length) *
            10
        ) / 10
      : null;

  return {
    year,
    inspectionCount: input.inspectionCount,
    treatmentCount: input.treatmentCount,
    splitCount: input.splitCount,
    harvestLbs: Math.round(input.harvestLbs * 10) / 10,
    avgMitePer100,
  };
}

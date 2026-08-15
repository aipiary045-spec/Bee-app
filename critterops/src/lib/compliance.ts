const THREE_YEARS_MS = 3 * 365 * 24 * 60 * 60 * 1000;

export function retentionUntil(submittedAt: Date) {
  return new Date(submittedAt.getTime() + THREE_YEARS_MS);
}

export function isRetained(retentionUntilDate: Date, now = new Date()) {
  return retentionUntilDate.getTime() >= now.getTime();
}

export function annualSummaryDueOn(year: number) {
  return new Date(Date.UTC(year + 1, 0, 30, 18, 0, 0));
}

export function annualSummaryIsDue(now = new Date()) {
  const year = now.getUTCFullYear();
  const due = annualSummaryDueOn(year - 1);
  return now.getTime() <= due.getTime() && now.getUTCMonth() === 0;
}

export type ChemicalRecord = {
  productName: string;
  epaRegNumber: string;
  targetPest: string;
  applicationRate: string;
  amountUsed: string;
  siteDescription: string;
  appliedAt: Date;
};

export function chemicalRecordComplete(record: ChemicalRecord) {
  return Boolean(
    record.productName &&
      record.epaRegNumber &&
      record.targetPest &&
      record.applicationRate &&
      record.amountUsed &&
      record.siteDescription &&
      record.appliedAt
  );
}

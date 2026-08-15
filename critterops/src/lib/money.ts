export function dollarsToCents(dollars: number) {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number) {
  return cents / 100;
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(centsToDollars(cents));
}

export function lineTotalCents(quantity: number, unitCents: number) {
  return quantity * unitCents;
}

export function sumLines(lines: { quantity: number; unitCents: number }[]) {
  return lines.reduce((sum, line) => sum + lineTotalCents(line.quantity, line.unitCents), 0);
}

export function taxOn(subtotalCents: number, rate = 0.045) {
  return Math.round(subtotalCents * rate);
}

export function invoiceBalance(totalCents: number, paymentsCents: number) {
  return Math.max(0, totalCents - paymentsCents);
}

export function invoiceStatus(balanceCents: number, totalCents: number, dueAt?: Date | null) {
  if (balanceCents <= 0) return "paid";
  if (balanceCents < totalCents) return "partial";
  if (dueAt && dueAt.getTime() < Date.now()) return "overdue";
  return "sent";
}

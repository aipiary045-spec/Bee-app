import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dollarsToCents,
  formatMoney,
  invoiceBalance,
  invoiceStatus,
  sumLines,
  taxOn,
} from "./money.ts";

test("converts dollars to cents without float drift", () => {
  assert.equal(dollarsToCents(149.5), 14950);
  assert.equal(formatMoney(14950), "$149.50");
});

test("rolls quote lines and Oklahoma-ish tax", () => {
  const subtotal = sumLines([
    { quantity: 1, unitCents: 18500 },
    { quantity: 2, unitCents: 4500 },
  ]);
  assert.equal(subtotal, 27500);
  assert.equal(taxOn(subtotal), 1238);
});

test("invoice status follows balance and due date", () => {
  assert.equal(invoiceBalance(20000, 20000), 0);
  assert.equal(invoiceStatus(0, 20000), "paid");
  assert.equal(invoiceStatus(5000, 20000), "partial");
  assert.equal(invoiceStatus(20000, 20000, new Date("2020-01-01")), "overdue");
});

import test from "node:test";
import assert from "node:assert/strict";
import { getPaymentStatus } from "../src/lib/payment.ts";

test("paid wins when the full amount is recorded", () => {
  assert.equal(
    getPaymentStatus(
      { status: "due", agreed_amount: 12000, amount_paid: 12000, due_date: "2025-01-01" },
      new Date("2026-07-25T10:00:00Z"),
    ),
    "paid",
  );
});

test("an unpaid past-due payment is derived as overdue", () => {
  assert.equal(
    getPaymentStatus(
      { status: "due", agreed_amount: 12000, amount_paid: 0, due_date: "2026-07-20" },
      new Date("2026-07-25T10:00:00Z"),
    ),
    "overdue",
  );
});

test("future payments keep their stored operational status", () => {
  assert.equal(
    getPaymentStatus(
      { status: "not_due", agreed_amount: 12000, amount_paid: 0, due_date: "2026-08-20" },
      new Date("2026-07-25T10:00:00Z"),
    ),
    "not_due",
  );
});

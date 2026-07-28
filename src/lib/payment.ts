import { isBefore, startOfDay } from "date-fns";
import type { Payment } from "@/lib/supabase/database.types";

export type DisplayPaymentStatus = "not_due" | "due" | "paid" | "overdue";

export function getPaymentStatus(
  payment: Pick<Payment, "status" | "agreed_amount" | "amount_paid" | "due_date">,
  today = new Date(),
): DisplayPaymentStatus {
  if (Number(payment.amount_paid) >= Number(payment.agreed_amount) || payment.status === "paid") {
    return "paid";
  }
  if (payment.due_date && isBefore(new Date(`${payment.due_date}T00:00:00`), startOfDay(today))) {
    return "overdue";
  }
  return payment.status === "overdue" ? "due" : payment.status;
}

export function paymentTone(status: DisplayPaymentStatus) {
  return status === "paid"
    ? "green"
    : status === "overdue"
      ? "red"
      : status === "due"
        ? "amber"
        : "neutral";
}

export function paymentLabel(status: DisplayPaymentStatus) {
  return status.replace("_", " ");
}

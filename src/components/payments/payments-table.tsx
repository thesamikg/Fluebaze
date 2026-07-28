"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Check, Pencil, Search, X } from "lucide-react";
import { toast } from "sonner";
import { markPaymentPaid, savePayment } from "@/app/(app)/payments/actions";
import type { PaymentRow } from "@/lib/data";
import { paymentLabel, paymentTone } from "@/lib/payment";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Banknote } from "lucide-react";

export function PaymentsTable({ payments }: { payments: PaymentRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [campaign, setCampaign] = useState("");
  const [editing, setEditing] = useState<PaymentRow | null>(null);
  const [pending, startTransition] = useTransition();
  const campaigns = useMemo(
    () => [...new Map(payments.map((payment) => [payment.campaign.id, payment.campaign])).values()],
    [payments],
  );
  const filtered = payments.filter((payment) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || payment.creator.full_name.toLowerCase().includes(q) || payment.campaign.name.toLowerCase().includes(q);
    return matchesSearch && (!status || payment.displayStatus === status) && (!campaign || payment.campaign.id === campaign);
  });

  function markPaid(payment: PaymentRow) {
    if (!window.confirm(`Mark the full ${formatCurrency(payment.agreed_amount, payment.currency)} payment to ${payment.creator.full_name} as paid?`)) return;
    startTransition(async () => {
      const result = await markPaymentPaid(payment.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      window.location.reload();
    });
  }

  return (
    <>
      <Card className="mb-4 p-3">
        <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_180px_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9188]" size={15} />
            <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search creator or campaign" aria-label="Search payments" />
          </label>
          <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter payment status">
            <option value="">All statuses</option><option value="not_due">Not due</option><option value="due">Due</option><option value="overdue">Overdue</option><option value="paid">Paid</option>
          </Select>
          <Select value={campaign} onChange={(event) => setCampaign(event.target.value)} aria-label="Filter by campaign">
            <option value="">All campaigns</option>{campaigns.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Select>
        </div>
      </Card>
      <Card className="overflow-hidden">
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-[#e5e7e0] bg-[#fafbf8] text-[10px] uppercase tracking-[.08em] text-[#8a9087]">
                <tr><th className="px-4 py-3">Creator</th><th className="px-4 py-3">Campaign</th><th className="px-4 py-3">Agreed</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Outstanding</th><th className="px-4 py-3">Due date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <tr key={payment.id} className="border-b border-[#eef0eb] last:border-0 hover:bg-[#fbfcf9]">
                    <td className="px-4 py-4"><Link className="font-semibold hover:underline" href={`/creators/${payment.creator.id}`}>{payment.creator.full_name}</Link><p className="mt-1 text-xs text-[#858b82]">{payment.creator.handle}</p></td>
                    <td className="px-4 py-4"><Link className="text-[#4d7307] hover:underline" href={`/campaigns/${payment.campaign.id}`}>{payment.campaign.name}</Link></td>
                    <td className="px-4 py-4 font-mono text-xs">{formatCurrency(payment.agreed_amount, payment.currency)}</td>
                    <td className="px-4 py-4 font-mono text-xs">{formatCurrency(payment.amount_paid, payment.currency)}</td>
                    <td className="px-4 py-4 font-mono text-xs font-semibold">{formatCurrency(payment.outstanding, payment.currency)}</td>
                    <td className="px-4 py-4 text-xs">{payment.due_date ? format(new Date(`${payment.due_date}T00:00:00`), "d MMM yyyy") : "—"}</td>
                    <td className="px-4 py-4"><Badge tone={paymentTone(payment.displayStatus)}>{paymentLabel(payment.displayStatus)}</Badge></td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(payment)}><Pencil size={14} /> Edit</Button>
                        {payment.displayStatus !== "paid" ? <Button variant="outline" size="sm" disabled={pending} onClick={() => markPaid(payment)}><Check size={14} /> Mark paid</Button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={payments.length ? Search : Banknote} title={payments.length ? "No payments match those filters" : "No payments to track yet"} description={payments.length ? "Try another creator, campaign or status." : "Payment records appear after you add creators to campaigns."} />
        )}
      </Card>
      {editing ? <PaymentEditDialog payment={editing} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function PaymentEditDialog({ payment, onClose }: { payment: PaymentRow; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="edit-payment-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div><h2 id="edit-payment-title" className="text-lg font-semibold">Edit payment</h2><p className="mt-1 text-sm text-[#70766e]">{payment.creator.full_name} · {payment.campaign.name}</p></div>
          <button aria-label="Close dialog" className="grid size-8 place-items-center rounded-md hover:bg-[#f0f1eb]" onClick={onClose}><X size={17} /></button>
        </div>
        <form
          className="mt-5 grid gap-4"
          action={(formData) => {
            startTransition(async () => {
              const paidDate = String(formData.get("paid_at") ?? "");
              const result = await savePayment({
                payment_id: payment.id,
                agreed_amount: formData.get("agreed_amount"),
                amount_paid: formData.get("amount_paid"),
                currency: payment.currency,
                status: formData.get("status"),
                due_date: formData.get("due_date"),
                paid_at: paidDate ? new Date(`${paidDate}T12:00:00`).toISOString() : "",
                payment_method: formData.get("payment_method"),
                reference_number: formData.get("reference_number"),
                notes: formData.get("notes"),
              });
              if (!result.ok) {
                toast.error(result.message);
                return;
              }
              toast.success(result.message);
              onClose();
              window.location.reload();
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Agreed amount"><Input name="agreed_amount" type="number" min={0} step="0.01" defaultValue={payment.agreed_amount} required /></Field>
            <Field label="Amount paid"><Input name="amount_paid" type="number" min={0} step="0.01" defaultValue={payment.amount_paid} required /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status"><Select name="status" defaultValue={payment.displayStatus === "overdue" ? "due" : payment.displayStatus}><option value="not_due">Not due</option><option value="due">Due</option><option value="paid">Paid</option></Select></Field>
            <Field label="Due date"><Input name="due_date" type="date" defaultValue={payment.due_date ?? ""} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Paid date"><Input name="paid_at" type="date" defaultValue={payment.paid_at ? format(new Date(payment.paid_at), "yyyy-MM-dd") : ""} /></Field>
            <Field label="Payment method"><Input name="payment_method" defaultValue={payment.payment_method ?? ""} placeholder="Bank transfer" /></Field>
          </div>
          <Field label="Transaction reference"><Input name="reference_number" defaultValue={payment.reference_number ?? ""} /></Field>
          <Field label="Notes"><Textarea name="notes" defaultValue={payment.notes ?? ""} /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : "Save payment"}</Button></div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

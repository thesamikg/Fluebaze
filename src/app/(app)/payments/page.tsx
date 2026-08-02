import { Banknote, CheckCircle2, WalletCards } from "lucide-react";
import { getPayments } from "@/lib/data";
import { PaymentsTable } from "@/components/payments/payments-table";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function PaymentsPage() {
  const payments = await getPayments();
  const outstanding = payments.reduce((sum, payment) => sum + payment.outstanding, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount_paid), 0);
  const overdueCount = payments.filter((payment) => payment.displayStatus === "overdue").length;

  return (
    <>
      <PageHeader eyebrow="Creator costs" title="Payments" description="Track creator fees, invoices, due dates, and payout status alongside each campaign. Fluebaze does not transfer money." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Summary icon={<WalletCards size={17} />} label="Outstanding" value={formatCurrency(outstanding)} />
        <Summary icon={<CheckCircle2 size={17} />} label="Total paid" value={formatCurrency(totalPaid)} />
        <Summary icon={<Banknote size={17} />} label="Overdue payments" value={String(overdueCount)} alert={overdueCount > 0} />
      </div>
      <PaymentsTable payments={payments} />
    </>
  );
}

function Summary({ icon, label, value, alert }: { icon: React.ReactNode; label: string; value: string; alert?: boolean }) {
  return (
    <Card className={alert ? "border-[#edc7c2] bg-[#fff8f7]" : ""}>
      <CardContent><p className="flex items-center gap-2 text-xs text-[#737970]">{icon}{label}</p><p className={`mt-3 text-2xl font-semibold tracking-[-.04em] ${alert ? "text-[#a34239]" : ""}`}>{value}</p></CardContent>
    </Card>
  );
}

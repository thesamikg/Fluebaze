"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, isBefore, startOfToday } from "date-fns";
import { CalendarClock, GripVertical, LayoutGrid, List, LoaderCircle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { removeCollaboration, updateCollaborationStage } from "@/app/(app)/campaigns/actions";
import type { CollaborationRow } from "@/lib/data";
import type { CollaborationStage } from "@/lib/supabase/database.types";
import { getPaymentStatus, paymentLabel, paymentTone } from "@/lib/payment";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const stages: { id: CollaborationStage; label: string }[] = [
  { id: "contacted", label: "Contacted" },
  { id: "confirmed", label: "Contracted" },
  { id: "content_due", label: "Product sent / content due" },
  { id: "posted", label: "Live" },
  { id: "paid", label: "Paid" },
];

export function Pipeline({ initialCollaborations }: { initialCollaborations: CollaborationRow[] }) {
  const [items, setItems] = useState(initialCollaborations);
  const [view, setView] = useState<"board" | "table">("board");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [paymentMove, setPaymentMove] = useState<CollaborationRow | null>(null);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const activeItem = items.find((item) => item.id === activeId) ?? null;

  function requestStage(item: CollaborationRow, stage: CollaborationStage) {
    if (item.stage === stage) return;
    if (stage === "paid") {
      setPaymentMove(item);
      return;
    }
    const previous = item.stage;
    setItems((current) => current.map((row) => row.id === item.id ? { ...row, stage } : row));
    startTransition(async () => {
      const result = await updateCollaborationStage({ collaborationId: item.id, stage });
      if (!result.ok) {
        setItems((current) => current.map((row) => row.id === item.id ? { ...row, stage: previous } : row));
        toast.error(result.message);
      } else {
        toast.success("Stage updated.");
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const item = items.find((row) => row.id === String(event.active.id));
    const target = stages.find((stage) => stage.id === event.over?.id)?.id;
    if (item && target) requestStage(item, target);
  }

  function completePayment(paid: boolean, paidDate?: string, referenceNumber?: string) {
    const item = paymentMove;
    if (!item) return;
    setPaymentMove(null);
    const target: CollaborationStage = paid ? "paid" : "posted";
    const previous = item.stage;
    setItems((current) => current.map((row) => row.id === item.id ? { ...row, stage: target } : row));
    startTransition(async () => {
      const result = await updateCollaborationStage({
        collaborationId: item.id,
        stage: target,
        paid,
        paidAt: paidDate ? new Date(`${paidDate}T12:00:00`).toISOString() : undefined,
        referenceNumber,
      });
      if (!result.ok) {
        setItems((current) => current.map((row) => row.id === item.id ? { ...row, stage: previous } : row));
        toast.error(result.message);
      } else {
        toast.success(paid ? "Payment recorded and collaboration completed." : "Collaboration kept in Live.");
      }
    });
  }

  function confirmRemove(item: CollaborationRow) {
    if (!window.confirm(`Remove ${item.creator.full_name} from this campaign? Their payment record will also be removed.`)) return;
    startTransition(async () => {
      const result = await removeCollaboration(item.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setItems((current) => current.filter((row) => row.id !== item.id));
      toast.success(result.message);
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-[-.02em]">Creator commerce pipeline</h2>
          <p className="mt-1 text-xs text-[#7c8279]">Move each partnership from outreach through product, content, launch, and payout.</p>
        </div>
        <div className="flex rounded-lg border border-[#dedfd8] bg-white p-1">
          <button className={`grid size-8 place-items-center rounded-md ${view === "board" ? "bg-[#171a17] text-white" : "text-[#747a72]"}`} onClick={() => setView("board")} aria-label="Board view" aria-pressed={view === "board"}><LayoutGrid size={15} /></button>
          <button className={`grid size-8 place-items-center rounded-md ${view === "table" ? "bg-[#171a17] text-white" : "text-[#747a72]"}`} onClick={() => setView("table")} aria-label="Table view" aria-pressed={view === "table"}><List size={15} /></button>
        </div>
      </div>
      {pending ? <div className="mb-3 flex items-center gap-2 text-xs text-[#777d75]"><LoaderCircle className="animate-spin" size={13} /> Saving change…</div> : null}
      {view === "board" ? (
        <DndContext sensors={sensors} onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
          <div className="grid min-w-max grid-cols-5 gap-3 pb-2">
            {stages.map((stage) => (
              <PipelineColumn key={stage.id} stage={stage} items={items.filter((item) => item.stage === stage.id)} onStage={requestStage} onRemove={confirmRemove} />
            ))}
          </div>
          <DragOverlay>{activeItem ? <PipelineCard item={activeItem} overlay onStage={requestStage} onRemove={confirmRemove} /> : null}</DragOverlay>
        </DndContext>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e0e2db] bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#e5e7e0] bg-[#fafbf8] text-[10px] uppercase tracking-[.08em] text-[#8a9087]">
              <tr><th className="px-4 py-3">Creator</th><th className="px-4 py-3">Stage</th><th className="px-4 py-3">Deliverable</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Fee</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {items.map((item) => <PipelineTableRow key={item.id} item={item} onStage={requestStage} onRemove={confirmRemove} />)}
            </tbody>
          </table>
        </div>
      )}
      {paymentMove ? <PaymentConfirmation item={paymentMove} onClose={() => setPaymentMove(null)} onComplete={completePayment} /> : null}
    </div>
  );
}

function PipelineColumn({ stage, items, onStage, onRemove }: { stage: (typeof stages)[number]; items: CollaborationRow[]; onStage: (item: CollaborationRow, stage: CollaborationStage) => void; onRemove: (item: CollaborationRow) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <section ref={setNodeRef} className={`w-[245px] rounded-xl border p-2 transition-colors ${isOver ? "border-[#86ad3b] bg-[#edf7dd]" : "border-[#e0e2dc] bg-[#edefe9]"}`}>
      <h3 className="flex items-center justify-between px-1.5 py-1 text-xs font-semibold text-[#5f655d]">
        {stage.label}<span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#858b82]">{items.length}</span>
      </h3>
      <div className="mt-1.5 grid min-h-28 gap-2 content-start">
        {items.map((item) => <DraggableCard key={item.id} item={item} onStage={onStage} onRemove={onRemove} />)}
      </div>
    </section>
  );
}

function DraggableCard({ item, onStage, onRemove }: { item: CollaborationRow; onStage: (item: CollaborationRow, stage: CollaborationStage) => void; onRemove: (item: CollaborationRow) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1 }} {...listeners} {...attributes}>
      <PipelineCard item={item} onStage={onStage} onRemove={onRemove} />
    </div>
  );
}

function PipelineCard({ item, overlay, onStage, onRemove }: { item: CollaborationRow; overlay?: boolean; onStage: (item: CollaborationRow, stage: CollaborationStage) => void; onRemove: (item: CollaborationRow) => void }) {
  const overdue = isBefore(new Date(`${item.deliverable_due_date}T00:00:00`), startOfToday()) && !["posted", "paid"].includes(item.stage);
  const status = item.payment ? getPaymentStatus(item.payment) : null;
  return (
    <article className={`rounded-lg border border-[#dfe1db] bg-white p-3 shadow-sm ${overlay ? "w-[245px] rotate-1 shadow-lg" : ""}`}>
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 shrink-0 text-[#abb0a8]" size={14} />
        <div className="min-w-0 flex-1">
          <Link href={`/creators/${item.creator.id}`} className="block truncate text-sm font-semibold hover:underline" onPointerDown={(event) => event.stopPropagation()}>{item.creator.full_name}</Link>
          <p className="mt-0.5 truncate text-[11px] text-[#858b82]">{item.creator.platform} · {item.creator.handle}</p>
        </div>
        <button aria-label={`Remove ${item.creator.full_name}`} className="text-[#a0a59e] hover:text-[#a34239]" onPointerDown={(event) => event.stopPropagation()} onClick={() => onRemove(item)}><Trash2 size={13} /></button>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#555b53]">{item.deliverable_description}</p>
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className={`inline-flex items-center gap-1 ${overdue ? "font-semibold text-[#b4473d]" : "text-[#7c8279]"}`}><CalendarClock size={12} /> {format(new Date(`${item.deliverable_due_date}T00:00:00`), "d MMM")}</span>
        <span className="font-mono font-semibold">{formatCurrency(item.agreed_fee, item.currency)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#eef0eb] pt-2.5" onPointerDown={(event) => event.stopPropagation()}>
        {status ? <Badge tone={paymentTone(status)}>{paymentLabel(status)}</Badge> : <span />}
        <Select className="h-7 w-[103px] py-0 text-[10px]" value={item.stage} aria-label={`Change stage for ${item.creator.full_name}`} onChange={(event) => onStage(item, event.target.value as CollaborationStage)}>
          {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
        </Select>
      </div>
    </article>
  );
}

function PipelineTableRow({ item, onStage, onRemove }: { item: CollaborationRow; onStage: (item: CollaborationRow, stage: CollaborationStage) => void; onRemove: (item: CollaborationRow) => void }) {
  const status = item.payment ? getPaymentStatus(item.payment) : null;
  return (
    <tr className="border-b border-[#eef0eb] last:border-0">
      <td className="px-4 py-3"><Link className="font-semibold hover:underline" href={`/creators/${item.creator.id}`}>{item.creator.full_name}</Link><p className="mt-1 text-xs text-[#858b82]">{item.creator.handle}</p></td>
      <td className="px-4 py-3"><Select className="w-32" value={item.stage} onChange={(event) => onStage(item, event.target.value as CollaborationStage)}>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</Select></td>
      <td className="px-4 py-3 text-[#5f655d]">{item.deliverable_count} × {item.deliverable_type}</td>
      <td className="px-4 py-3 text-xs">{format(new Date(`${item.deliverable_due_date}T00:00:00`), "d MMM yyyy")}</td>
      <td className="px-4 py-3 font-mono text-xs">{formatCurrency(item.agreed_fee, item.currency)}</td>
      <td className="px-4 py-3">{status ? <Badge tone={paymentTone(status)}>{paymentLabel(status)}</Badge> : "—"}</td>
      <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" aria-label="Remove collaboration" onClick={() => onRemove(item)}><Trash2 size={14} /></Button></td>
    </tr>
  );
}

function PaymentConfirmation({ item, onClose, onComplete }: { item: CollaborationRow; onClose: () => void; onComplete: (paid: boolean, paidDate?: string, referenceNumber?: string) => void }) {
  const defaultDate = format(new Date(), "yyyy-MM-dd");
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="payment-dialog-title" className="w-full max-w-md rounded-2xl border border-[#e0e2db] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="payment-dialog-title" className="text-lg font-semibold tracking-[-.025em]">Has {item.creator.full_name} been paid?</h2><p className="mt-1 text-sm leading-6 text-[#6f756d]">Paid is the final pipeline stage and records the payment completion.</p></div>
          <button aria-label="Close dialog" className="grid size-8 place-items-center rounded-md hover:bg-[#f0f1eb]" onClick={onClose}><X size={17} /></button>
        </div>
        <form action={(formData) => onComplete(true, String(formData.get("paid_date")), String(formData.get("reference_number") ?? ""))} className="mt-5 grid gap-4">
          <div className="grid gap-2"><Label>Paid date</Label><Input type="date" name="paid_date" defaultValue={defaultDate} required /></div>
          <div className="grid gap-2"><Label>Transaction reference <span className="font-normal text-[#8b9188]">· optional</span></Label><Input name="reference_number" placeholder="UTR or transfer ID" /></div>
          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onComplete(false)}>Not paid yet — keep Live</Button>
            <Button type="submit" variant="primary">Confirm paid</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

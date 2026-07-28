import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f6f1] p-6 text-center">
      <div>
        <span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#171a17] font-bold text-[#c7ff4a]">F</span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[.12em] text-[#7d837a]">404 · Not found</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">That record isn’t here.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#70766e]">It may have been removed, or it may belong to another workspace.</p>
        <Button asChild className="mt-6"><Link href="/dashboard"><ArrowLeft size={15} /> Back to dashboard</Link></Button>
      </div>
    </main>
  );
}

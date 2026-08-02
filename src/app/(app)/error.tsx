"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#fde8e6] text-[#a34239]"><AlertTriangle size={20} /></span>
        <h1 className="mt-4 text-xl font-semibold">Something didn’t load</h1>
        <p className="mt-2 text-sm leading-6 text-[#6f756d]">Your data is safe. Try loading this page again.</p>
        <Button className="mt-5" onClick={reset}><RefreshCw size={16} /> Try again</Button>
      </div>
    </div>
  );
}

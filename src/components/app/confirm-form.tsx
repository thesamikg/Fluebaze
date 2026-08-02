"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmForm({
  action,
  label,
  message,
  variant = "ghost",
}: {
  action: () => Promise<void>;
  label: string;
  message: string;
  variant?: "ghost" | "outline" | "destructive";
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <Button type="submit" size="sm" variant={variant}>
        <Trash2 size={14} /> {label}
      </Button>
    </form>
  );
}

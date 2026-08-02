import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full resize-y rounded-lg border border-[#d9dbd3] bg-white px-3 py-2 text-sm text-[#171a17] outline-none placeholder:text-[#979d95] focus:border-[#779d2f] focus:ring-3 focus:ring-[#c7ff4a]/35 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

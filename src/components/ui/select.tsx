import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-[#d9dbd3] bg-white px-3 pr-9 text-sm text-[#171a17] outline-none focus:border-[#779d2f] focus:ring-3 focus:ring-[#c7ff4a]/35 disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777d75]"
        size={15}
      />
    </span>
  );
}

export { Select };

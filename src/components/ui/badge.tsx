import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue" | "lime";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-[#f0f1ed] text-[#60665e]",
  green: "bg-[#e6f4e9] text-[#257046]",
  amber: "bg-[#fff3d8] text-[#8a5d08]",
  red: "bg-[#fde8e6] text-[#a34239]",
  blue: "bg-[#e9f0f8] text-[#3c6694]",
  lime: "bg-[#edffc5] text-[#4d7307]",
};

function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex w-max items-center rounded-full px-2 py-1 text-[11px] font-semibold capitalize leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };

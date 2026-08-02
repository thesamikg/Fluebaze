import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#c7ff4a]/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#171a17] px-4 text-white hover:bg-[#30352f]",
        primary: "bg-[#c7ff4a] px-4 text-[#171a17] hover:bg-[#d5ff78]",
        outline: "border border-[#dedfd8] bg-white px-4 text-[#30352f] hover:bg-[#f5f6f1]",
        ghost: "px-3 text-[#535a52] hover:bg-[#f0f1eb]",
        destructive: "bg-[#b4473d] px-4 text-white hover:bg-[#963a33]",
        link: "min-h-0 p-0 text-[#4d7307] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10",
        sm: "h-8 min-h-8 rounded-md px-3 text-xs",
        lg: "h-11 px-5",
        icon: "size-10 min-h-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

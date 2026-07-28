import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 grid size-11 place-items-center rounded-xl bg-[#f0f1eb] text-[#6b7168]">
        <Icon size={20} />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#6f756d]">{description}</p>
      {actionLabel && href ? (
        <Button asChild variant="primary" className="mt-5">
          <a href={href}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}

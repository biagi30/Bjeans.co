import type { ReactNode } from "react";
import { cn } from "@/core/lib/utils";

type PillProps = {
  children: ReactNode;
  className?: string;
  tone?: "muted" | "accent";
};

const toneStyles: Record<NonNullable<PillProps["tone"]>, string> = {
  muted:
    "border border-white/10 bg-white/5 text-muted-foreground",
  accent:
    "border border-primary/40 bg-primary/15 text-primary-foreground",
};

export function Pill({ children, className, tone = "muted" }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em]",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

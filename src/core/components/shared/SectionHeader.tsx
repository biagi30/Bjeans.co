import { cn } from "@/core/lib/utils";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export type StatItemProps = {
  value: string;
  label: string;
};

export function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="space-y-1">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

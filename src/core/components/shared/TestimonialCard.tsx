export type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
};

export function TestimonialCard({
  quote,
  name,
  role,
}: TestimonialCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-secondary/30 p-6">
      <p className="text-sm text-muted-foreground">{quote}</p>
      <p className="mt-4 text-sm font-semibold">{name}</p>
      <p className="text-xs text-muted-foreground">{role}</p>
    </div>
  );
}

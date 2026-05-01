import { Container, SectionHeader } from "@/core/components/shared";

type CheckoutSectionProps = {
  items: string[];
};

export function CheckoutSection({ items }: CheckoutSectionProps) {
  return (
    <Container className="space-y-8">
      <SectionHeader
        eyebrow="Unified cart"
        title="One checkout. Two fulfillment paths."
        description="Mix retail items with bespoke orders. Our system splits them automatically for a frictionless experience."
      />
      <div className="grid gap-4 rounded-3xl border border-white/10 bg-secondary/30 p-8 md:grid-cols-3">
        {items.map((item) => (
          <div key={item}>
            <p className="text-sm font-semibold">{item}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Automatic routing per workflow.
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}

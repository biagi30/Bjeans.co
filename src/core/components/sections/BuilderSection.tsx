import { Container, SectionHeader } from "@/core/components/shared";

type BuilderStep = {
  title: string;
  body: string;
};

type BuilderSectionProps = {
  steps: BuilderStep[];
};

export function BuilderSection({ steps }: BuilderSectionProps) {
  return (
    <Container className="grid gap-10">
      <SectionHeader
        eyebrow="Bespoke system"
        title="Build your denim in four deliberate steps."
        description="Fabric, fit, detail, measurement. Each step is saved and synced to your profile for future builds."
      />
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-3xl border border-white/10 bg-secondary/30 p-6"
          >
            <p className="text-sm font-semibold">{step.title}</p>
            <p className="mt-3 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}

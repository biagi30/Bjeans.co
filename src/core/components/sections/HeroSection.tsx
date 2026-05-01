import Image from "next/image";
import type { StatItemProps } from "@/core/components/shared";
import { Button, Container, Pill, StatItem } from "@/core/components/shared";

type HeroSectionProps = {
  stats: StatItemProps[];
  image: string;
  headline: string;
  description: string;
};

export function HeroSection({
  stats,
  image,
  headline,
  description,
}: HeroSectionProps) {
  return (
    <div className="landing-hero relative overflow-hidden">
      <div className="grain-overlay pointer-events-none absolute inset-0" />
      <Container className="flex flex-col gap-16 pb-24 pt-10">
        <header className="fade-in-up flex items-center justify-between gap-6">
          <div className="font-[var(--font-display)] text-2xl tracking-tight">
            Bjeans.co
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <span>Shop</span>
            <span>Custom Builder</span>
            <span>Craft</span>
            <span>Journal</span>
          </nav>
          <Button className="px-5 py-2" variant="primary">
            Book Fitting
          </Button>
        </header>

        <section className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex flex-col gap-8">
            <Pill className="fade-in-up">Premium denim house</Pill>
            <div className="fade-in-up-delay space-y-6">
              <h1 className="text-balance font-[var(--font-display)] text-4xl font-semibold leading-tight md:text-6xl">
                {headline}
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button>Start Custom Build</Button>
              <Button variant="outline">Shop Ready-to-Wear</Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <StatItem key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
          <div className="relative h-[460px] overflow-hidden rounded-[32px] border border-white/10">
            <Image
              src={image}
              alt="Raw denim hero"
              fill
              priority
              className="object-cover"
            />
          </div>
        </section>
      </Container>
    </div>
  );
}

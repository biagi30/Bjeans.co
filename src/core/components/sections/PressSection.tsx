import Image from "next/image";
import {
  Container,
  SectionHeader,
  TestimonialCard,
} from "@/core/components/shared";
import type { TestimonialCardProps } from "@/core/components/shared";

type PressSectionProps = {
  testimonials: TestimonialCardProps[];
  image: string;
  outlets: string[];
};

export function PressSection({
  testimonials,
  image,
  outlets,
}: PressSectionProps) {
  return (
    <Container className="space-y-8">
      <SectionHeader
        eyebrow="Press + stories"
        title="Selected press & client stories."
        description="A curated glimpse into why fashion editors and denim purists choose Bjeans.co."
      />
      <div className="flex flex-wrap gap-3">
        {outlets.map((name) => (
          <span
            key={name}
            className="rounded-full border border-white/10 bg-secondary/30 px-5 py-2 text-xs font-semibold tracking-[0.3em]"
          >
            {name}
          </span>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
        <TestimonialCard {...testimonials[0]} />
        <div className="relative min-h-[220px] overflow-hidden rounded-[28px] border border-white/10">
          <Image src={image} alt="Denim texture" fill className="object-cover" />
        </div>
        <TestimonialCard {...testimonials[1]} />
      </div>
    </Container>
  );
}

import Image from "next/image";
import { Container, SectionHeader } from "@/core/components/shared";

type CraftSectionProps = {
  image: string;
};

export function CraftSection({ image }: CraftSectionProps) {
  return (
    <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="relative h-[360px] overflow-hidden rounded-[32px] border border-white/10">
        <Image src={image} alt="Denim craft" fill className="object-cover" />
      </div>
      <div className="space-y-4">
        <SectionHeader
          eyebrow="Atelier craft"
          title="Measured by hand, finished in obsidian wash."
          description="Our atelier blends modern patterning with artisanal finish. Every custom piece is cut, stitched, and washed with precision."
        />
      </div>
    </Container>
  );
}

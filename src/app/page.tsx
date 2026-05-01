import {
  BuilderSection,
  CollectionSection,
  CraftSection,
  CtaSection,
  CheckoutSection,
  FooterSection,
  HeroSection,
  PressSection,
} from "@/core/components";
import {
  landingBuilderSteps,
  landingCheckoutItems,
  landingImages,
  landingOutlets,
  landingProducts,
  landingStats,
  landingTestimonials,
} from "@/core/data/landing.data";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection
        stats={landingStats}
        image={landingImages.hero}
        headline="Tailored denim, made for motion."
        description="From ready-to-wear staples to bespoke craftsmanship, Bjeans.co delivers a unified cart that splits orders seamlessly for retail and custom fulfillment."
      />

      <main className="flex flex-col gap-24 pb-24 pt-20">
        <BuilderSection steps={landingBuilderSteps} />
        <CollectionSection products={landingProducts} />
        <CraftSection image={landingImages.craft} />
        <CheckoutSection items={landingCheckoutItems} />
        <PressSection
          testimonials={landingTestimonials}
          image={landingImages.press}
          outlets={landingOutlets}
        />
        <CtaSection />
      </main>

      <FooterSection />
    </div>
  );
}

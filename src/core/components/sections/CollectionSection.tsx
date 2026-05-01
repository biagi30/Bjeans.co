import { Container, ProductCard, SectionHeader } from "@/core/components/shared";
import type { ProductCardProps } from "@/core/components/shared";

type CollectionSectionProps = {
  products: ProductCardProps[];
};

export function CollectionSection({ products }: CollectionSectionProps) {
  return (
    <Container className="space-y-8">
      <SectionHeader
        eyebrow="Retail drop"
        title="Essential silhouettes. Sculpted washes."
        description="Shop ready-to-wear denim with premium Japanese fabrics and a tailored finish."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.title} {...product} />
        ))}
      </div>
    </Container>
  );
}

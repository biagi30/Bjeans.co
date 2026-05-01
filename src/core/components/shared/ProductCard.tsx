import Image from "next/image";

export type ProductCardProps = {
  title: string;
  meta: string;
  image: string;
  imageAlt?: string;
};

export function ProductCard({ title, meta, image, imageAlt }: ProductCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-secondary/30 p-5">
      <div className="relative h-56 overflow-hidden rounded-2xl">
        <Image src={image} alt={imageAlt ?? title} fill className="object-cover" />
      </div>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {meta}
        </p>
      </div>
    </div>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resizeAndCropImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        const targetRatio = 4 / 3;
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        let xOffset = 0;
        let yOffset = 0;

        if (sourceWidth / sourceHeight > targetRatio) {
          sourceWidth = sourceHeight * targetRatio;
          xOffset = (img.width - sourceWidth) / 2;
        } else {
          sourceHeight = sourceWidth / targetRatio;
          yOffset = (img.height - sourceHeight) / 2;
        }

        canvas.width = 800;
        canvas.height = 600;

        ctx.drawImage(
          img,
          xOffset,
          yOffset,
          sourceWidth,
          sourceHeight,
          0,
          0,
          800,
          600
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert canvas to blob"));
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
export function getFitImage(fit: { name: string; image?: string }) {
  // If the image is a valid remote URL or a base64 string, use it
  if (fit.image && (fit.image.startsWith("http") || fit.image.startsWith("data:"))) {
    return fit.image;
  }
  
  // Otherwise, use fallback high-quality Unsplash URLs of real denim jeans based on the fit name
  const name = fit.name.toLowerCase();
  if (name.includes("slim")) {
    return "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"; // Slim Fit (Hanging denim)
  }
  if (name.includes("regular")) {
    return "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=600&q=80"; // Regular Fit (Folded denim)
  }
  if (name.includes("straight")) {
    return "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80"; // Straight Cut (Flat texture denim)
  }
  if (name.includes("wide")) {
    return "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80"; // Wide Leg (Loose hanging denim)
  }
  if (name.includes("skinny")) {
    return "https://images.unsplash.com/photo-1519961655809-34fc1568cd77?auto=format&fit=crop&w=600&q=80"; // Skinny Fit (Legs in slim/skinny denim)
  }
  if (name.includes("taper")) {
    return "https://images.unsplash.com/photo-1640336437338-5c36f7e1115f?auto=format&fit=crop&w=600&q=80"; // Tapered (Hanging tapered denim)
  }
  if (name.includes("bootcut")) {
    return "https://images.unsplash.com/photo-1532190370294-e81fe487b61a?auto=format&fit=crop&w=600&q=80"; // Bootcut (Back pocket denim pocket detail)
  }
  if (name.includes("relaxed")) {
    return "https://images.unsplash.com/photo-1531169509526-f8f1fdaa4a67?auto=format&fit=crop&w=600&q=80"; // Relaxed (Legs sitting on ledge)
  }
  
  // Default fallback if path is a broken relative one
  return "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80";
}





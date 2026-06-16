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
  // If the image is a valid remote URL, local path, or base64 string, use it
  if (fit.image && (fit.image.startsWith("/") || fit.image.startsWith("http") || fit.image.startsWith("data:"))) {
    return fit.image;
  }
  
  // Otherwise, use fallback local images of denim jeans based on the fit name
  const name = fit.name.toLowerCase();
  if (name.includes("slim")) {
    return "/images/slim_fit.png";
  }
  if (name.includes("regular")) {
    return "/images/regular_fit.png";
  }
  if (name.includes("straight")) {
    return "/images/straight_cut.png";
  }
  if (name.includes("wide")) {
    return "/images/wide_leg.png";
  }
  if (name.includes("skinny")) {
    return "/images/slim_fit.png";
  }
  if (name.includes("taper")) {
    return "/images/slim_fit.png";
  }
  if (name.includes("bootcut")) {
    return "/images/regular_fit.png";
  }
  if (name.includes("relaxed")) {
    return "/images/regular_fit.png";
  }
  
  // Default fallback to straight cut
  return "/images/straight_cut.png";
}





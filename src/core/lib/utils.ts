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




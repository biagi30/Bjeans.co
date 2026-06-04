import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse("File is required", 400);
    }

    if (!file.type.startsWith("image/")) {
      return errorResponse("Only image files are allowed", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("File is too large (max 5MB)", 400);
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return errorResponse("Unsupported file type", 400);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const image = sharp(buffer, { failOn: "none" });
    const meta = await image.metadata();

    if (!meta.width || !meta.height) {
      return errorResponse("Failed to read image size", 400);
    }

    const targetRatio = 4 / 3;
    let cropWidth = meta.width;
    let cropHeight = meta.height;

    if (cropWidth / cropHeight > targetRatio) {
      cropWidth = Math.floor(cropHeight * targetRatio);
    } else {
      cropHeight = Math.floor(cropWidth / targetRatio);
    }

    const left = Math.floor((meta.width - cropWidth) / 2);
    const top = Math.floor((meta.height - cropHeight) / 2);

    await image
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .toFile(filePath);

    return successResponse({ url: `/uploads/${fileName}` }, 201);
  } catch (error: any) {
    return errorResponse(error.message || "Upload failed", 500);
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

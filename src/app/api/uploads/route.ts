import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    return successResponse({ url: base64Data }, 201);
  } catch (error: any) {
    return errorResponse(error.message || "Upload failed", 500);
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

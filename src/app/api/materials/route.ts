import { connectDatabase } from "@/backend/config/db";
import { Material } from "@/backend/models";
import {
  validateBody,
  materialCreateSchema,
} from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function GET() {
  try {
    await connectDatabase();
    const materials = await Material.find().sort({ createdAt: -1 });
    return successResponse(materials);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(materialCreateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const material = await Material.create(value);
    return successResponse(material, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

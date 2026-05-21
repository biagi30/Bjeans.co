import { connectDatabase } from "@/backend/config/db";
import { CustomOption } from "@/backend/models";
import {
  validateBody,
  customOptionCreateSchema,
} from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function GET() {
  try {
    await connectDatabase();
    const options = await CustomOption.find().sort({ createdAt: -1 });
    return successResponse(options);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(customOptionCreateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const option = await CustomOption.create(value);
    return successResponse(option, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

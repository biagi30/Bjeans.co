import { connectDatabase } from "@/backend/config/db";
import { MeasurementProfile } from "@/backend/models";
import {
  validateBody,
  measurementCreateSchema,
} from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function GET() {
  try {
    await connectDatabase();
    const profiles = await MeasurementProfile.find()
      .populate("user")
      .sort({ createdAt: -1 });
    return successResponse(profiles);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(measurementCreateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const profile = await MeasurementProfile.create(value);
    return successResponse(profile, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

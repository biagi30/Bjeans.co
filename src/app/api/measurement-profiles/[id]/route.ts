import { connectDatabase } from "@/backend/config/db";
import { MeasurementProfile } from "@/backend/models";
import {
  validateBody,
  measurementUpdateSchema,
  isValidObjectId,
} from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid id parameter", 400);
    }

    await connectDatabase();
    const profile = await MeasurementProfile.findById(id).populate("user");

    if (!profile) {
      return errorResponse("Measurement profile not found", 404);
    }

    return successResponse(profile);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid id parameter", 400);
    }

    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(measurementUpdateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const profile = await MeasurementProfile.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    }).populate("user");

    if (!profile) {
      return errorResponse("Measurement profile not found", 404);
    }

    return successResponse(profile);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid id parameter", 400);
    }

    await connectDatabase();
    const profile = await MeasurementProfile.findByIdAndDelete(id);

    if (!profile) {
      return errorResponse("Measurement profile not found", 404);
    }

    return successResponse({ message: "Measurement profile deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

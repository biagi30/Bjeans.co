import { connectDatabase } from "@/backend/config/db";
import { CustomOption } from "@/backend/models";
import {
  validateBody,
  customOptionUpdateSchema,
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
    const option = await CustomOption.findById(id);

    if (!option) {
      return errorResponse("Custom option not found", 404);
    }

    return successResponse(option);
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
    const { error, value } = validateBody<any>(customOptionUpdateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const option = await CustomOption.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    if (!option) {
      return errorResponse("Custom option not found", 404);
    }

    return successResponse(option);
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
    const option = await CustomOption.findByIdAndDelete(id);

    if (!option) {
      return errorResponse("Custom option not found", 404);
    }

    return successResponse({ message: "Custom option deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

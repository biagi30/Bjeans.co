import { connectDatabase } from "@/backend/config/db";
import { Material } from "@/backend/models";
import {
  validateBody,
  materialUpdateSchema,
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
    const material = await Material.findById(id);

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    return successResponse(material);
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
    const { error, value } = validateBody<any>(materialUpdateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const material = await Material.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    return successResponse(material);
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
    const material = await Material.findByIdAndDelete(id);

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    return successResponse({ message: "Material deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

import { connectDatabase } from "@/backend/config/db";
import { Cart } from "@/backend/models";
import {
  validateBody,
  cartUpdateSchema,
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
    const cart = await Cart.findById(id).populate("user");

    if (!cart) {
      return errorResponse("Cart not found", 404);
    }

    return successResponse(cart);
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
    const { error, value } = validateBody<any>(cartUpdateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const cart = await Cart.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    }).populate("user");

    if (!cart) {
      return errorResponse("Cart not found", 404);
    }

    return successResponse(cart);
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
    const cart = await Cart.findByIdAndDelete(id);

    if (!cart) {
      return errorResponse("Cart not found", 404);
    }

    return successResponse({ message: "Cart deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

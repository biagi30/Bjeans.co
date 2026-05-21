import { connectDatabase } from "@/backend/config/db";
import { Order } from "@/backend/models";
import {
  validateBody,
  paymentUpdateSchema,
  isValidObjectId,
} from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

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
    const { error, value } = validateBody<any>(paymentUpdateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const { paymentStatus, status, updatedBy } = value;
    const updateData: any = {
      paymentStatus,
      updatedBy: updatedBy || null,
    };

    if (status) {
      updateData.status = status;
    } else if (paymentStatus === "paid") {
      updateData.status = "processing";
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("customer");

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    return successResponse(order);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

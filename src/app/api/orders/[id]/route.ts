import { connectDatabase } from "@/backend/config/db";
import { Order, Product } from "@/backend/models";
import {
  validateBody,
  orderUpdateSchema,
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
    const order = await Order.findById(id).populate("customer");

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    return successResponse(order);
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
    const { error, value } = validateBody<any>(orderUpdateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const updateData = { ...value };
    // Auto-fill updatedBy if it's sent in body
    if (body.updatedBy) {
      updateData.updatedBy = body.updatedBy;
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
    
    // Find the order first to restore stock
    const order = await Order.findById(id);
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Restore stock for retail items if the order is unpaid
    if (order.paymentStatus === "unpaid") {
      for (const item of order.items) {
        if (item.itemType === "retail" && item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    return successResponse({ message: "Order deleted and stock restored" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

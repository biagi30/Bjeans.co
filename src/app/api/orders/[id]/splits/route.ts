import { connectDatabase } from "@/backend/config/db";
import { Order } from "@/backend/models";
import { isValidObjectId } from "@/backend/utils/validate";
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
    const splits = await Order.find({ parentOrder: id })
      .sort({ createdAt: -1 })
      .populate("customer");

    return successResponse(splits);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

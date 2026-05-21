import { connectDatabase } from "@/backend/config/db";
import { Order } from "@/backend/models";
import { validateBody, orderCreateSchema } from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function GET() {
  try {
    await connectDatabase();
    const orders = await Order.find().sort({ createdAt: -1 }).populate("customer");
    return successResponse(orders);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(orderCreateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const order = await Order.create(value);
    return successResponse(order, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

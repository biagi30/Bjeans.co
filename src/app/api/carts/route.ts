import { connectDatabase } from "@/backend/config/db";
import { Cart } from "@/backend/models";
import { validateBody, cartCreateSchema } from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function GET() {
  try {
    await connectDatabase();
    const carts = await Cart.find().sort({ createdAt: -1 }).populate("user");
    return successResponse(carts);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(cartCreateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const cart = await Cart.create(value);
    return successResponse(cart, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

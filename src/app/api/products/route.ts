import { NextResponse } from "next/server";
import { connectDatabase } from "@/backend/config/db";
import { Product } from "@/backend/models";
import {
  validateBody,
  productCreateSchema,
} from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function GET() {
  try {
    await connectDatabase();
    const products = await Product.find().sort({ createdAt: -1 });
    return successResponse(products);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(productCreateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const product = await Product.create(value);
    return successResponse(product, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

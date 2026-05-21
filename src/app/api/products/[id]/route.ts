import { NextResponse } from "next/server";
import { connectDatabase } from "@/backend/config/db";
import { Product } from "@/backend/models";
import {
  validateBody,
  productUpdateSchema,
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
    const product = await Product.findById(id);

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product);
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
    const { error, value } = validateBody<any>(productUpdateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const product = await Product.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product);
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
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse({ message: "Product deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

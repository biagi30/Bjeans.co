import { connectDatabase } from "@/backend/config/db";
import { User } from "@/backend/models";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "bjeans-secret-key-fallback";
  return new TextEncoder().encode(secret);
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const verified = await jwtVerify(token, getJwtSecretKey());
    const payload = verified.payload as { id: string };

    await connectDatabase();
    
    const user = await User.findById(payload.id).select("-password -__v");

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse({ user }, 200);
  } catch (error: any) {
    return errorResponse("Authentication failed", 401);
  }
}

export const dynamic = "force-dynamic";
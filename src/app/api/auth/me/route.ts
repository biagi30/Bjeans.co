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
      const response = errorResponse("Not authenticated", 401);
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return response;
    }

    const verified = await jwtVerify(token, getJwtSecretKey());
    const payload = verified.payload as { id: string };

    await connectDatabase();
    
    const user = await User.findById(payload.id).select("-password -__v");

    if (!user) {
      const response = errorResponse("User not found", 404);
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }

    const response = successResponse({ user }, 200);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (error: any) {
    const response = errorResponse("Authentication failed", 401);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }
}

export const dynamic = "force-dynamic";
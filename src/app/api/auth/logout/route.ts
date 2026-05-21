import { successResponse } from "@/backend/utils/apiResponse";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  return successResponse({ message: "Logged out successfully" }, 200);
}

export const dynamic = "force-dynamic";

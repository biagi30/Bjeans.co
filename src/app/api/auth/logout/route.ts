import { successResponse } from "@/backend/utils/apiResponse";

export async function POST() {
  const response = successResponse({ message: "Logged out successfully" }, 200);
  response.cookies.delete("auth_token");
  return response;
}

export const dynamic = "force-dynamic";

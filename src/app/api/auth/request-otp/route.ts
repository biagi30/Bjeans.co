import { connectDatabase } from "@/backend/config/db";
import { User } from "@/backend/models";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";
import { kirimOTP } from "@/backend/services/otpService";

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return errorResponse("Email wajib diisi", 400);
    }

    // Pastikan user terdaftar
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse("Email tidak terdaftar", 404);
    }

    const result = await kirimOTP(email, user.name, user.phone);
    return successResponse(result, 200);
  } catch (error: any) {
    return errorResponse("Gagal mengirim OTP: " + error.message, 500);
  }
}

export const dynamic = "force-dynamic";

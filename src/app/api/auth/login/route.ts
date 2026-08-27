import bcrypt from "bcryptjs";
import { connectDatabase } from "@/backend/config/db";
import { User } from "@/backend/models";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";
import { kirimOTP } from "@/backend/services/otpService";

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email dan password wajib diisi", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return errorResponse("Email atau password salah", 401);
    }

    if (!user.password) {
      return errorResponse("Email atau password salah", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse("Email atau password salah", 401);
    }

    // Kredensial valid → kirim OTP ke email
    await kirimOTP(email, user.name);

    return successResponse(
      { message: "Kredensial valid. Kode OTP telah dikirim ke email kamu." },
      200
    );
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const dynamic = "force-dynamic";

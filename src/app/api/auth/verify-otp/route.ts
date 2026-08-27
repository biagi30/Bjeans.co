import { connectDatabase } from "@/backend/config/db";
import { User } from "@/backend/models";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";
import { verifikasiOTP } from "@/backend/services/otpService";
import { SignJWT } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "bjeans-secret-key-fallback";
  return new TextEncoder().encode(secret);
};

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { email, otp } = body;

    if (!email || !otp) {
      return errorResponse("Email dan OTP wajib diisi", 400);
    }

    // Verifikasi OTP
    const verifikasi = verifikasiOTP(email, otp);
    if (!verifikasi.valid) {
      return errorResponse(verifikasi.message, 401);
    }

    // Cari user
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse("User tidak ditemukan", 404);
    }

    const userObj = user.toObject();
    delete userObj.password;

    // Buat JWT Token (sama dengan login password)
    const token = await new SignJWT({
      id: userObj._id.toString(),
      email: userObj.email,
      role: userObj.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getJwtSecretKey());

    const response = successResponse(
      { message: "Login berhasil!", user: userObj },
      200
    );
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const dynamic = "force-dynamic";

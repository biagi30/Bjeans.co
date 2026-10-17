import bcrypt from "bcryptjs";
import { connectDatabase } from "@/backend/config/db";
import { User } from "@/backend/models";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";
import { kirimOTP } from "@/backend/services/otpService";
import { SignJWT } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "bjeans-secret-key-fallback";
  return new TextEncoder().encode(secret);
};

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

    // ── Admin: langsung buat JWT, bypass OTP ──────────────────────────────────
    if (user.role === "admin") {
      const userObj = user.toObject();
      delete userObj.password;

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
        {
          message: "Login berhasil!",
          user: userObj,
          adminDirect: true,
        },
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
    }

    // ── Customer: kirim OTP ke WhatsApp/Email ─────────────────────────────────
    const otpResult = await kirimOTP(email, user.name, user.phone);

    return successResponse(
      {
        message: otpResult.message || "Kredensial valid. Kode OTP telah dikirim.",
        channel: otpResult.channel,
      },
      200
    );
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const dynamic = "force-dynamic";

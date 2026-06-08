import bcrypt from "bcryptjs";
import { connectDatabase } from "@/backend/config/db";
import { User } from "@/backend/models";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "bjeans-secret-key-fallback";
  return new TextEncoder().encode(secret);
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    let payload: { id: string };
    try {
      const verified = await jwtVerify(token, getJwtSecretKey());
      payload = verified.payload as { id: string };
    } catch {
      return errorResponse("Invalid or expired session", 401);
    }

    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return errorResponse("Password lama dan baru harus diisi", 400);
    }

    if (newPassword.length < 6) {
      return errorResponse("Password baru minimal harus 6 karakter", 400);
    }

    const user = await User.findById(payload.id).select("+password");
    if (!user || !user.password) {
      return errorResponse("User tidak ditemukan", 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return errorResponse("Password lama Anda salah", 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return successResponse({ message: "Password berhasil diperbarui" }, 200);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const dynamic = "force-dynamic";

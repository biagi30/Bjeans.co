import bcrypt from "bcryptjs";
import { connectDatabase } from "@/backend/config/db";
import { User } from "@/backend/models";
import { validateBody, userCreateSchema } from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

const SALT_ROUNDS = 10;

export async function GET() {
  try {
    await connectDatabase();
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return successResponse(users);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(userCreateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const userData = { ...value };
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, SALT_ROUNDS);
    }

    const user = await User.create(userData);
    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(userObj, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";

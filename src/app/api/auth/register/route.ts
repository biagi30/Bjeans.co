import bcrypt from "bcryptjs";
import { connectDatabase } from "@/backend/config/db";
import { User } from "@/backend/models";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { name, email, password, phone, address } = body;

    if (!name || !email || !password || !phone || !address) {
      return errorResponse("All fields are required", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse("Email already in use", 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "customer",
      phone,
      address,
    });

    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;

    return successResponse({ user: userObj, message: "Registration successful" }, 201);
  } catch (error: any) {
    console.error("Register Error:", error);
    return errorResponse(error.message, 500);
  }
}

export const dynamic = "force-dynamic";
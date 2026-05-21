import { NextResponse } from "next/server";
import { connectDatabase } from "@/backend/config/db";

export async function GET() {
  try {
    await connectDatabase();
    return NextResponse.json({
      success: true,
      message: "BJeans.co Next.js fullstack backend is running",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to database",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";

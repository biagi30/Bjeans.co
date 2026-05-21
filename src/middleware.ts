import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "bjeans-secret-key-fallback";
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  // Routes to protect and their allowed roles
  const pathname = request.nextUrl.pathname;
  
  const isAdminRoute = pathname.startsWith("/admin");
  const isCheckoutRoute = pathname.startsWith("/checkout");
  const isProfileRoute = pathname.startsWith("/profile");

  if (!isAdminRoute && !isCheckoutRoute && !isProfileRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    if (isAdminRoute || isCheckoutRoute || isProfileRoute) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  try {
    const verified = await jwtVerify(token!, getJwtSecretKey());
    const payload = verified.payload as { role: string };

    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }

    // if it's a checkout or profile route, any authenticated role is fine (customer, admin, etc.)

    return NextResponse.next();
  } catch (err) {
    // Invalid token
    if (isAdminRoute || isCheckoutRoute || isProfileRoute) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
  }
}

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/profile/:path*"],
};

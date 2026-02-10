import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import nextAuthMiddleware, { type NextRequestWithAuth } from "next-auth/middleware";

export function proxy(request: NextRequest) {
  // Allow unauthenticated access to the login page to avoid redirect loop
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }
  return nextAuthMiddleware(request as NextRequestWithAuth);
}

export const config = {
  matcher: ["/admin/:path*"],
};

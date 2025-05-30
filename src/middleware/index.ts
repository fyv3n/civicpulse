import type { NextRequest } from "next/server";
import { verifySession } from "./auth/verifySession";

export async function middleware(request: NextRequest) {
  return verifySession(request);
}

export const config = {
  matcher: [
    "/create/:path*",
    "/comment/:path*",
    "/profile/edit/:path*",
    "/admin/:path*",
    "/barangay-settings/:path*",
    "/moderation/:path*"
  ],
}; 
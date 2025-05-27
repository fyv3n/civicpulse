import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATHS = ["/admin", "/barangay-settings", "/moderation"];
const MODERATOR_PATHS = ["/moderation"];
const RESTRICTED_PATHS = ["/create", "/comment", "/profile/edit"];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const userData = JSON.parse(session);
    const userRole = userData.role;

    if (!userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const path = request.nextUrl.pathname;

    if (ADMIN_PATHS.some(p => path.startsWith(p)) && userRole !== 'admin') {
      return NextResponse.redirect(new URL("/feed", request.url));
    }

    if (MODERATOR_PATHS.some(p => path.startsWith(p)) && !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.redirect(new URL("/feed", request.url));
    }

    if (RESTRICTED_PATHS.some(p => path.startsWith(p)) && !userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Middleware error:', err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
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

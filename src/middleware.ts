import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that require verification
const RESTRICTED_PATHS = [
  "/create",
  "/comment",
  "/profile/edit"
]

// Paths that require admin role
const ADMIN_PATHS = [
  "/admin",
  "/barangay-settings",
  "/moderation"
]

// Paths that require moderator role
const MODERATOR_PATHS = [
  "/moderation"
]

export async function middleware(request: NextRequest) {
  // Get the session cookie
  const session = request.cookies.get('__session')?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Get the user role from the session cookie
    const userData = JSON.parse(session);
    const userRole = userData.role;

    if (!userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if the path requires admin role
    const requiresAdmin = ADMIN_PATHS.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    if (requiresAdmin && userRole !== 'admin') {
      return NextResponse.redirect(new URL("/feed", request.url));
    }

    // Check if the path requires moderator role
    const requiresModerator = MODERATOR_PATHS.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    if (requiresModerator && userRole !== 'moderator' && userRole !== 'admin') {
      return NextResponse.redirect(new URL("/feed", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
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
  ]
} 
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_PATHS, MODERATOR_PATHS, RESTRICTED_PATHS } from "../constants/routes";

export async function verifySession(request: NextRequest) {
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
    console.error('Session verification error:', err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
} 
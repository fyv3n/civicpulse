import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/firebase/config"
import { getUserProfile } from "@/lib/firebase/users"

// Paths that require verification
const RESTRICTED_PATHS = [
  "/create",
  "/comment",
  "/profile/edit"
]

export async function middleware(request: NextRequest) {
  const session = await auth.currentUser

  // If no session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Check if the path requires verification
  const requiresVerification = RESTRICTED_PATHS.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (requiresVerification) {
    const userProfile = await getUserProfile(session.uid)
    
    if (!userProfile?.isVerified) {
      // Redirect to verification page with return URL
      const returnUrl = encodeURIComponent(request.nextUrl.pathname)
      return NextResponse.redirect(
        new URL(`/verify?returnUrl=${returnUrl}`, request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/create/:path*",
    "/comment/:path*",
    "/profile/edit/:path*"
  ]
} 
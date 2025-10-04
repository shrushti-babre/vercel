import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Only protect server-side routes (not dashboards)
const protectedRoutes: string[] = [
  // e.g., "/admin", "/api/protected"
]

const publicRoutes: string[] = ["/", "/login", "/signup", "/about", "/contact"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Check other protected routes
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  if (isProtected) {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Everything else (like /dashboard/*) is allowed for client-side auth
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
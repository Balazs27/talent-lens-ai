import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

const PUBLIC_PATHS = ["/", "/login", "/signup", "/callback", "/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { user, supabaseResponse } = await updateSession(request)

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return supabaseResponse
  }

  // Unauthenticated → redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Fetch role from user metadata (set during signup)
  const role = user.user_metadata?.role as string | undefined

  // Role-based routing guards
  if (pathname.startsWith("/employee")) {
    if (role === "hr") {
      const url = request.nextUrl.clone()
      url.pathname = "/hr/dashboard"
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith("/hr")) {
    if (role !== "hr" && role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/employee/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

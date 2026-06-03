import { NextResponse } from "next/server";

/**
 * Next.js Edge Middleware for route protection.
 * Runs on the Edge runtime.
 */
export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/portfolio") || 
    pathname.startsWith("/watchlist") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");
                           
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // 1. Redirect unauthenticated users trying to access protected routes to /login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users trying to access login/signup pages to /dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolio/:path*",
    "/watchlist/:path*",
    "/onboarding",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};

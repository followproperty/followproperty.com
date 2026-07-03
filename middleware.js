import { NextResponse } from "next/server";

/**
 * Helper to determine the correct redirection path for a builder based on status.
 */
function getBuilderRedirectUrl(builderStatus, baseUrl) {
  if (builderStatus === "approved") {
    return new URL("/builder-dashboard", baseUrl);
  } else if (builderStatus === "pending") {
    return new URL("/builder-application-status", baseUrl);
  } else {
    return new URL("/builder-register", baseUrl);
  }
}

/**
 * Next.js Edge Middleware for route protection.
 * Runs on the Edge runtime.
 */
export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("user_role")?.value;
  const builderStatus = request.cookies.get("builder_status")?.value;
  const { pathname } = request.nextUrl;

  const isBuilderRoute = 
    pathname.startsWith("/builder-dashboard") || 
    pathname === "/builder-register" || 
    pathname === "/builder-application-status";

  const isProtectedRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/portfolio") || 
    pathname.startsWith("/watchlist") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/rera") ||
    pathname.startsWith("/property") ||
    isBuilderRoute;

  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // 1. Redirect unauthenticated users trying to access protected routes to /login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users trying to access login/signup pages
  if (token && isAuthRoute) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (role === "builder" || builderStatus === "draft" || builderStatus === "rejected" || builderStatus === "pending") {
      return NextResponse.redirect(getBuilderRedirectUrl(builderStatus, request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. Enforce Role-Based Route Protection for Authenticated Sessions
  if (token) {
    // Admin Route Protection: Only admin can access /admin
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Builder Route Protection: Allow registered builder applicants or approved builders
    if (isBuilderRoute) {
      const isApprovedBuilder = role === "builder" || builderStatus === "approved";
      const isApplyingBuilder = builderStatus === "draft" || builderStatus === "rejected" || builderStatus === "pending";

      if (!isApprovedBuilder && !isApplyingBuilder) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      
      // Enforce correct builder sub-route based on application status
      if (isApprovedBuilder && pathname !== "/builder-dashboard") {
        return NextResponse.redirect(new URL("/builder-dashboard", request.url));
      }
      if (builderStatus === "pending" && pathname !== "/builder-application-status") {
        return NextResponse.redirect(new URL("/builder-application-status", request.url));
      }
      if ((builderStatus === "draft" || builderStatus === "rejected") && pathname !== "/builder-register") {
        return NextResponse.redirect(new URL("/builder-register", request.url));
      }
    }

    // Normal User Route Protection: Builders & builder applicants cannot access normal user views
    const isUserRoute = 
      pathname.startsWith("/dashboard") || 
      pathname.startsWith("/portfolio") || 
      pathname.startsWith("/watchlist") || 
      pathname.startsWith("/onboarding");

    if (isUserRoute) {
      if (role === "builder" || builderStatus === "draft" || builderStatus === "rejected" || builderStatus === "pending") {
        return NextResponse.redirect(getBuilderRedirectUrl(builderStatus, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolio/:path*",
    "/watchlist/:path*",
    "/settings/:path*",
    "/onboarding",
    "/admin/:path*",
    "/builder-dashboard/:path*",
    "/builder-register",
    "/builder-application-status",
    "/login",
    "/signup",
    "/rera/:path*",
    "/rera",
    "/property/:path*",
  ],
};

/**
 * Authentication Middleware
 * 
 * This middleware runs before every request and protects:
 * - Dashboard routes (admin access)
 * - Creator routes (creator account access)
 * 
 * INTEGRATION:
 * 1. Implement authentication check (NextAuth, Clerk, etc.)
 * 2. Configure protected routes
 * 3. Update checkAuth function with your auth provider
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ==============================================
// Configuration
// ==============================================

// Dashboard routes that require admin authentication
const dashboardProtectedRoutes = [
  "/",
  "/projects",
  "/legal",
  "/insurance",
  "/integrations",
  "/settings",
  "/analytics",
  "/creative",
];

// Creator routes that require creator authentication
const creatorProtectedRoutes = [
  "/creator/profile",
  "/creator/dashboard",
];

// Public creator routes (no auth required)
const creatorPublicRoutes = [
  "/creator/login",
  "/creator/signup",
  "/creator/forgot-password",
  "/creator/reset-password",
  "/creator/invite",
];

// Public routes (no auth required)
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
];

// ==============================================
// Middleware Function
// ==============================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Check if route is a creator public route
  const isCreatorPublicRoute = creatorPublicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is a creator protected route
  const isCreatorProtectedRoute = creatorProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is a dashboard protected route
  const isDashboardProtectedRoute = dashboardProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow public routes
  if (isPublicRoute || isCreatorPublicRoute) {
    return NextResponse.next();
  }

  // Check authentication
  const authResult = await checkAuth(request);

  // Handle creator routes
  if (isCreatorProtectedRoute) {
    if (!authResult.isCreatorAuthenticated) {
      const loginUrl = new URL("/creator/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Handle dashboard routes
  if (isDashboardProtectedRoute) {
    if (!authResult.isAdminAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Default: allow access
  return NextResponse.next();
}

// ==============================================
// Helper Functions
// ==============================================

interface AuthResult {
  isAdminAuthenticated: boolean;
  isCreatorAuthenticated: boolean;
}

async function checkAuth(request: NextRequest): Promise<AuthResult> {
  // TODO: Implement your authentication check
  // 
  // Example with cookie-based auth:
  // const adminToken = request.cookies.get('admin-auth-token')?.value;
  // const creatorToken = request.cookies.get('creator-auth-token')?.value;
  // 
  // return {
  //   isAdminAuthenticated: !!adminToken && await validateAdminToken(adminToken),
  //   isCreatorAuthenticated: !!creatorToken && await validateCreatorToken(creatorToken),
  // };

  // For development: allow all requests
  // Remove this in production!
  if (process.env.NODE_ENV === "development") {
    return {
      isAdminAuthenticated: true,
      isCreatorAuthenticated: true,
    };
  }

  // Production: check cookies or tokens
  const adminToken = request.cookies.get("admin-auth-token")?.value;
  const creatorToken = request.cookies.get("creator-auth-token")?.value;

  return {
    isAdminAuthenticated: !!adminToken,
    isCreatorAuthenticated: !!creatorToken,
  };
}

// ==============================================
// Middleware Configuration
// ==============================================

export const config = {
  // Match all routes except static files and API routes
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Define role-based route permissions
const routePermissions = {
  // Admin routes
  "/dashboard/users": ["admin"],
  "/dashboard/staff": ["admin"],

  // Librarian routes
  "/dashboard/books": ["admin", "librarian"],
  "/dashboard/authors": ["admin", "librarian"],
  "/dashboard/publishers": ["admin", "librarian"],
  "/dashboard/loans": ["admin", "librarian"],
  "/dashboard/fines": ["admin", "librarian"],
  "/dashboard/readers": ["admin", "librarian"],

  // Reader routes
  "/dashboard/catalog": ["reader"],
  "/dashboard/my-loans": ["reader"],
  "/dashboard/my-fines": ["reader"],
  "/dashboard/profile": ["admin", "librarian", "reader"], // All roles can access profile

  // Base dashboard - accessible to all authenticated users
  "/dashboard": ["admin", "librarian", "reader"],
};

// Helper function to decode JWT token and extract user info
function decodeToken(token: string): { role: string; id: string } | null {
  try {
    // In a real application, you should verify the token with the secret
    // For now, we'll decode without verification (not recommended for production)
    const decoded = jwt.decode(token) as any;
    if (decoded && decoded.role && decoded.id) {
      return { role: decoded.role, id: decoded.id };
    }
  } catch (error) {
    console.error("Token decode error:", error);
  }
  return null;
}

// Helper function to check if user has access to a route
function hasRouteAccess(pathname: string, userRole: string): boolean {
  // Check exact match first
  if (routePermissions[pathname as keyof typeof routePermissions]) {
    return routePermissions[pathname as keyof typeof routePermissions].includes(
      userRole,
    );
  }

  // Check for partial matches (e.g., /dashboard/books/123 should match /dashboard/books)
  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route + "/") || pathname === route) {
      return allowedRoles.includes(userRole);
    }
  }

  // If no specific route permission found, deny access to dashboard subroutes
  if (pathname.startsWith("/dashboard/") && pathname !== "/dashboard") {
    return false;
  }

  return true;
}

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /auth/login, /dashboard)
  const { pathname } = request.nextUrl;

  // Get the token from cookies or headers
  const token =
    request.cookies.get("auth-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/auth/login", "/auth/register"];

  // Define auth routes that should redirect if user is already logged in
  const authRoutes = ["/auth/login", "/auth/register"];

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard"];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);

  // If user has a token and tries to access auth routes, redirect to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user doesn't have a token and tries to access protected routes, redirect to login
  if (!token && isProtectedRoute) {
    // Store the attempted URL to redirect after login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control for authenticated users
  if (token && isProtectedRoute) {
    const userInfo = decodeToken(token);

    if (!userInfo) {
      // Invalid token - redirect to login
      const loginUrl = new URL("/auth/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth-token");
      return response;
    }

    // Check if user has access to this specific route
    if (!hasRouteAccess(pathname, userInfo.role)) {
      // Redirect to appropriate dashboard based on role
      let redirectPath = "/dashboard";
      switch (userInfo.role) {
        case "admin":
          redirectPath = "/dashboard";
          break;
        case "librarian":
          redirectPath = "/dashboard";
          break;
        case "reader":
          redirectPath = "/dashboard";
          break;
        default:
          redirectPath = "/auth/login";
      }

      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // For all other cases, continue with the request
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

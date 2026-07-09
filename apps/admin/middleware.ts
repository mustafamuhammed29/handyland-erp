import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/ NextResponse";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Root redirect
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Role-based route protection
    // Only OWNER and MANAGER can access /settings and /analytics
    if (pathname.startsWith("/settings") || pathname.startsWith("/analytics")) {
      if (token?.role !== "OWNER" && token?.role !== "MANAGER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    }
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};

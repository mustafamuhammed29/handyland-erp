import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "handyland-secret-key-change-in-production",
});

export const config = {
  matcher: [
    // Protect all routes except login, api routes, and static files
    "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
  ],
};

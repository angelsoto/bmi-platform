import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthApi =
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/auth/signin");
  const isPublic = pathname === "/" || isAuthApi;

  // Allow public assets and auth routes
  if (isPublic) return;

  // Redirect unauthenticated users to auto-login
  if (!req.auth && (pathname.startsWith("/dashboard") || pathname.startsWith("/api/"))) {
    const loginUrl = new URL("/auth/signin?auto=demo@bmi-platform.com", req.url);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

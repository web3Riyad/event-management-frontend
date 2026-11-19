import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    "/events/create",
    "/events/manage",
    "/events/joined",
    "/add-event",
    "/manage-events",
    "/joined-events",
  ];

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    const allCookies = request.cookies.getAll();
    const hasSessionCookie = allCookies.some(
      (c) =>
        (c.name.includes("session_token") ||
          c.name.includes("better-auth.session") ||
          c.name === "better-auth.session_token" ||
          c.name === "__Secure-better-auth.session_token") &&
        Boolean(c.value && c.value.trim() !== "")
    );

    if (!hasSessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/events/create/:path*",
    "/events/create",
    "/events/manage/:path*",
    "/events/manage",
    "/events/joined/:path*",
    "/events/joined",
    "/add-event/:path*",
    "/add-event",
    "/manage-events/:path*",
    "/manage-events",
    "/joined-events/:path*",
    "/joined-events",
  ],
};

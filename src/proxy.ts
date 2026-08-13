import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth?.user?.id);
  const isAuthPage = ["/login", "/register"].includes(req.nextUrl.pathname);
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
  if (isAdminPage && req.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/messages/:path*",
    "/history/:path*",
    "/notes/:path*",
    "/calendar/:path*",
    "/profile/:path*",
    "/help/:path*",
    "/admin/:path*",
  ],
};

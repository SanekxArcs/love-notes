import { auth } from "@/auth"
import { NextResponse } from "next/server"
 
export default auth((req) => {

  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";
  const isHomePage = req.nextUrl.pathname === "/";
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
  const isAdminUser = req.auth?.user?.role === "admin";

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isAuthPage && !isHomePage) {
    console.log("Not logged in, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthPage) {
    console.log("Already logged in, redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // Protect admin routes
  if (isLoggedIn && isAdminPage && !isAdminUser) {
    console.log("Non-admin accessing admin page, redirecting");
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

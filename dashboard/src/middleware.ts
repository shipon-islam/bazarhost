import { API_BASE } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

// Change this to the actual cookie name set by your backend.
const AUTH_COOKIE = "bz_admin_token";
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/";

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    if (isAdminRoute) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("from", pathname);

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Validate the cookie with your backend.
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (isAdminRoute) {
        const loginUrl = new URL("/", request.url);
        loginUrl.searchParams.set("from", pathname);

        const redirect = NextResponse.redirect(loginUrl);
        redirect.cookies.delete(AUTH_COOKIE);

        return redirect;
      }

      return NextResponse.next();
    }

    const result = await response.json();
    const user = result?.data?.user;

    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAdminRoute) {
      const isAdmin =
        user.role?.slug === "admin" ||
        user.role?.isSuperAdmin === true ||
        user.isSuperAdmin === true;

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    if (isLoginRoute) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};

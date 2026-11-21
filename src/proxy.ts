import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, hasLocale, matchLocale } from "@/i18n/config";
import { updateSession } from "@/lib/supabase/proxy";

// Pages anyone can open without signing in (path after /ar or /en).
const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];
// Pages a signed-in user doesn't need (they get sent to the dashboard).
const GUEST_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];

function matches(path: string, list: string[]) {
  return list.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Runs before every page request:
 * 1. Makes sure the URL starts with a language (/ar or /en).
 * 2. Refreshes the Supabase login session.
 * 3. Sends signed-out visitors to the login page.
 * This is a fast first check only; pages check permissions again on the server.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase email links (confirm sign-up, reset password) land here.
  if (pathname.startsWith("/auth/")) {
    return (await updateSession(request)).response;
  }

  const [, first, ...rest] = pathname.split("/");
  if (!hasLocale(first)) {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = hasLocale(saved)
      ? saved
      : matchLocale(request.headers.get("accept-language")) ?? defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = first;
  const path = `/${rest.join("/")}`.replace(/\/$/, "") || "/";
  const { response, userId } = await updateSession(request);

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${target}`;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    // Keep any refreshed session cookies.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (path === "/") return redirectTo(userId ? "/dashboard" : "/login");
  if (!userId && !matches(path, PUBLIC_PATHS)) return redirectTo("/login");
  if (userId && matches(path, GUEST_ONLY_PATHS)) return redirectTo("/dashboard");

  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return response;
}

export const config = {
  // Everything except Next.js internals and files with an extension (images, etc.)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};

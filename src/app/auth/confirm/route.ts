import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { LOCALE_COOKIE, defaultLocale, hasLocale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Where links in Supabase emails land (confirm sign-up, reset password).
 * Supports both link styles Supabase can send:
 *   ?code=...                      (default email templates, PKCE flow)
 *   ?token_hash=...&type=...       (custom email templates)
 * Then forwards to ?next=/ar/dashboard (or similar).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = hasLocale(saved) ? saved : defaultLocale;

  const nextParam = searchParams.get("next");
  // Only allow redirects inside this site.
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : `/${locale}/dashboard`;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  try {
    const supabase = await createClient();
    if (code) {
      ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
    } else if (tokenHash && type) {
      ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
    }
  } catch {
    ok = false;
  }

  const target = request.nextUrl.clone();
  target.search = "";
  if (ok) {
    target.pathname = next;
  } else {
    target.pathname = `/${locale}/login`;
    target.searchParams.set("error", "link");
  }
  return NextResponse.redirect(target);
}

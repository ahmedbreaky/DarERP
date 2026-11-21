import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseEnv, SupabaseNotConfiguredError } from "./env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Create a new one per request (it reads the request's cookies).
 * Queries run AS THE SIGNED-IN USER, so Row Level Security applies.
 */
export async function createClient() {
  // Supabase reads the clock (token expiry), so this must only run at request
  // time - never while Next.js prerenders or prefetches a page.
  await connection();
  const cookieStore = await cookies();
  const env = getSupabaseEnv();
  if (!env) throw new SupabaseNotConfiguredError();

  return createServerClient<Database>(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: the proxy (src/proxy.ts) refreshes the session.
        }
      },
    },
  });
}

import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { connection } from "next/server";
import { getSupabaseEnv } from "./supabase/env";
import { createClient } from "./supabase/server";
import { isPermission, type Permission, type Role } from "./permissions";

/**
 * Data Access Layer for the signed-in user.
 * Always check access on the server with these helpers - hiding a button in
 * the UI is not security. The database (RLS) enforces the same rules again.
 */
export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  permissions: Permission[];
};

/** The signed-in user with their profile and permissions, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!getSupabaseEnv()) {
    await connection(); // decide at request time, not at build time
    return null;
  }
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;

  const [{ data: profile }, { data: permissions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active")
      .eq("id", userId)
      .maybeSingle(),
    supabase.rpc("my_permissions"),
  ]);
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    isActive: profile.is_active,
    permissions: (permissions ?? []).filter(isPermission),
  };
});

export function can(user: CurrentUser, permission: Permission): boolean {
  return user.isActive && user.permissions.includes(permission);
}

/** For pages: signed in AND approved, otherwise redirect. */
export async function requireUser(lang: Locale): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);
  if (!user.isActive) redirect(`/${lang}/pending`);
  return user;
}

/** For pages: must also have the permission, otherwise go back to the dashboard. */
export async function requirePermission(lang: Locale, permission: Permission): Promise<CurrentUser> {
  const user = await requireUser(lang);
  if (!can(user, permission)) redirect(`/${lang}/dashboard`);
  return user;
}

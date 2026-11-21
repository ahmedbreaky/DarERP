"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { authErrorKey } from "@/lib/auth-errors";
import type { FormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSiteUrl } from "@/lib/site-url";

const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8);

function safeLocale(value: string): Locale {
  return hasLocale(value) ? value : defaultLocale;
}

export async function login(lang: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const locale = safeLocale(lang);
  const values = { email: String(formData.get("email") ?? "") };
  if (!getSupabaseEnv()) return { error: "notConfigured", values };

  const parsed = z
    .object({ email, password: z.string().min(1) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "invalidCredentials", values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: authErrorKey(error), values };

  redirect(`/${locale}/dashboard`);
}

export async function signup(lang: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const locale = safeLocale(lang);
  const values = {
    email: String(formData.get("email") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
  };
  if (!getSupabaseEnv()) return { error: "notConfigured", values };

  const parsed = z
    .object({ fullName: z.string().trim().min(1).max(120), email, password })
    .safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return {
      error: field === "password" ? "weakPassword" : field === "email" ? "invalidEmail" : "required",
      values,
    };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/${locale}/dashboard`,
    },
  });
  if (error) return { error: authErrorKey(error), values };

  // Email confirmation turned off in Supabase -> already signed in.
  if (data.session) redirect(`/${locale}/dashboard`);

  return { ok: true, values };
}

export async function forgotPassword(
  lang: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = safeLocale(lang);
  const values = { email: String(formData.get("email") ?? "") };
  if (!getSupabaseEnv()) return { error: "notConfigured", values };

  const parsed = email.safeParse(formData.get("email"));
  if (!parsed.success) return { error: "invalidEmail", values };

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/auth/confirm?next=/${locale}/reset-password`,
  });
  // Don't reveal whether the email exists - only surface rate limiting.
  if (error && authErrorKey(error) === "rateLimit") return { error: "rateLimit", values };

  return { ok: true, values };
}

export async function resetPassword(
  lang: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = safeLocale(lang);
  if (!getSupabaseEnv()) return { error: "notConfigured" };

  const parsed = password.safeParse(formData.get("password"));
  if (!parsed.success) return { error: "weakPassword" };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { error: "linkInvalid" };

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: authErrorKey(error) };

  redirect(`/${locale}/dashboard`);
}

export async function logout(lang: string): Promise<void> {
  const locale = safeLocale(lang);
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(`/${locale}/login`);
}

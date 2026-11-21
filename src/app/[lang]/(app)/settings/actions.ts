"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { authErrorKey } from "@/lib/auth-errors";
import type { FormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();
  if (!me) return { error: "notAllowed" };

  const parsed = z.string().trim().min(1).max(120).safeParse(formData.get("fullName"));
  if (!parsed.success) return { error: "required" };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: parsed.data }).eq("id", me.id);
  if (error) return { error: "generic" };

  refresh();
  return { ok: true };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();
  if (!me) return { error: "notAllowed" };

  const parsed = z.string().min(8).safeParse(formData.get("password"));
  if (!parsed.success) return { error: "weakPassword" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: authErrorKey(error) };
  return { ok: true };
}

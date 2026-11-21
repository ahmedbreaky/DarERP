"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { can, getCurrentUser } from "@/lib/auth";
import type { ErrorKey } from "@/lib/form-state";
import { ROLES } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

const input = z.object({
  userId: z.guid(),
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional(),
});

/** Change a user's role and/or approve / deactivate them. */
export async function updateUser(raw: z.input<typeof input>): Promise<{ error?: ErrorKey }> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { error: "generic" };

  const me = await getCurrentUser();
  if (!me || !can(me, "users.manage")) return { error: "notAllowed" };

  const { userId, role, isActive } = parsed.data;
  const patch: { role?: typeof role; is_active?: boolean } = {};
  if (role !== undefined) patch.role = role;
  if (isActive !== undefined) patch.is_active = isActive;

  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select("id");
  if (error) return { error: error.message.includes("last_admin") ? "lastAdmin" : "generic" };
  if (!data?.length) return { error: "notAllowed" };

  refresh();
  return {};
}

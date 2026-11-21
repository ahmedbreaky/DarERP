"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { can, getCurrentUser } from "@/lib/auth";
import type { ErrorKey } from "@/lib/form-state";
import { EDITABLE_ROLES, PERMISSIONS } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

const input = z.object({
  role: z.enum(EDITABLE_ROLES),
  permission: z.enum(PERMISSIONS),
  enabled: z.boolean(),
});

/** Give or take away one permission from a role. */
export async function setRolePermission(raw: z.input<typeof input>): Promise<{ error?: ErrorKey }> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { error: "generic" };

  const me = await getCurrentUser();
  if (!me || !can(me, "roles.manage")) return { error: "notAllowed" };

  const { role, permission, enabled } = parsed.data;
  const supabase = await createClient();
  const { error } = enabled
    ? await supabase
        .from("role_permissions")
        .upsert({ role, permission }, { onConflict: "role,permission", ignoreDuplicates: true })
    : await supabase.from("role_permissions").delete().match({ role, permission });

  if (error) return { error: "generic" };
  refresh();
  return {};
}

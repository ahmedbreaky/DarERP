// Every permission the app checks. Must match the rows in public.permissions
// (see supabase/migrations). To add one: add a migration that inserts it,
// add it here, and add its label to both dictionaries (i18n/dictionaries).
export const PERMISSIONS = ["users.view", "users.manage", "roles.manage"] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLES = ["admin", "manager", "staff"] as const;
export type Role = (typeof ROLES)[number];

/** Roles whose permissions can be edited (admin always has everything). */
export const EDITABLE_ROLES = ["manager", "staff"] as const satisfies readonly Role[];

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

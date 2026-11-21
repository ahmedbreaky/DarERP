/**
 * Supabase connection settings (Supabase dashboard > Project Settings > API).
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is the new name; the older
 * NEXT_PUBLIC_SUPABASE_ANON_KEY is accepted too. Both are safe to expose to the
 * browser - Row Level Security in the database protects the data.
 */
export function getSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (see README.md).",
    );
    this.name = "SupabaseNotConfiguredError";
  }
}

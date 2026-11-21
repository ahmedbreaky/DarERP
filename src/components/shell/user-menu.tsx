import { LogOut } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/[lang]/(auth)/actions";
import { Button } from "../ui/button";

export async function UserMenu({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const name = user.fullName || user.email;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-3 border-s border-border ps-3">
      <div className="hidden text-end sm:block">
        <p className="text-sm leading-tight font-medium">{name}</p>
        <p className="text-xs text-muted">{dict.roles[user.role]}</p>
      </div>
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
      >
        {initial}
      </span>
      <form action={logout.bind(null, lang)}>
        <Button type="submit" variant="ghost" size="sm" aria-label={dict.nav.signOut} title={dict.nav.signOut}>
          <LogOut className="size-4 rtl:-scale-x-100" aria-hidden />
        </Button>
      </form>
    </div>
  );
}

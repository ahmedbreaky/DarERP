import { LayoutDashboard, ShieldCheck, UserCog, Users } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { can, getCurrentUser } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";
import { NavLink } from "./nav-link";

type Item = { href: string; label: string; icon: React.ReactNode; permission?: Permission };

/**
 * The sidebar menu. Items are hidden when the user lacks the permission.
 * To add a module: add an item here (and its page under src/app/[lang]/(app)).
 */
export async function SidebarNav({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();

  const main: Item[] = [
    { href: `/${lang}/dashboard`, label: dict.nav.dashboard, icon: <LayoutDashboard /> },
  ];
  const admin: Item[] = [
    { href: `/${lang}/users`, label: dict.nav.users, icon: <Users />, permission: "users.view" },
    { href: `/${lang}/roles`, label: dict.nav.roles, icon: <ShieldCheck />, permission: "roles.manage" },
    { href: `/${lang}/settings`, label: dict.nav.settings, icon: <UserCog /> },
  ];

  const visible = (items: Item[]) =>
    items.filter((item) => !item.permission || (user && can(user, item.permission)));

  return (
    <nav className="space-y-6">
      <Section title={dict.nav.main} items={visible(main)} />
      <Section title={dict.nav.admin} items={visible(admin)} />
    </nav>
  );
}

function Section({ title, items }: { title: string; items: Item[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-muted uppercase">{title}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { requirePermission } from "@/lib/auth";
import { EDITABLE_ROLES, PERMISSIONS } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { PermissionToggle } from "./permission-toggle";

export async function generateMetadata({ params }: PageProps<"/[lang]/roles">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: (await getDictionary(lang)).rolesPage.title };
}

export default async function RolesPage({ params }: PageProps<"/[lang]/roles">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict] = await Promise.all([getDictionary(lang), requirePermission(lang, "roles.manage")]);
  const t = dict.rolesPage;

  const supabase = await createClient();
  const { data } = await supabase.from("role_permissions").select("role, permission");
  const granted = new Set((data ?? []).map((r) => `${r.role}:${r.permission}`));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-5 py-3 text-start font-medium">{t.permission}</th>
              <th className="w-28 px-3 py-3 text-center font-medium">{dict.roles.admin}</th>
              {EDITABLE_ROLES.map((role) => (
                <th key={role} className="w-28 px-3 py-3 text-center font-medium">
                  {dict.roles[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PERMISSIONS.map((perm) => (
              <tr key={perm}>
                <td className="px-5 py-3.5">
                  <p className="font-medium">{dict.permissions[perm].label}</p>
                  <p className="text-xs text-muted">{dict.permissions[perm].description}</p>
                </td>
                <td className="px-3 py-3.5 text-center">
                  <Check className="mx-auto size-4.5 text-muted" aria-label={t.adminNote} />
                </td>
                {EDITABLE_ROLES.map((role) => (
                  <td key={role} className="px-3 py-3.5 text-center">
                    <PermissionToggle
                      role={role}
                      permission={perm}
                      enabled={granted.has(`${role}:${perm}`)}
                      label={`${dict.roles[role]}: ${dict.permissions[perm].label}`}
                      errorText={dict.errors}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-border px-5 py-3 text-xs text-muted">{t.adminNote}</p>
      </Card>
    </div>
  );
}

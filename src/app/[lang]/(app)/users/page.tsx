import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { can, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { UserActions } from "./user-actions";

export async function generateMetadata({ params }: PageProps<"/[lang]/users">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: (await getDictionary(lang)).users.title };
}

export default async function UsersPage({ params }: PageProps<"/[lang]/users">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, me] = await Promise.all([getDictionary(lang), requirePermission(lang, "users.view")]);
  const t = dict.users;
  const canManage = can(me, "users.manage");

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active, created_at")
    // Waiting for approval first, then newest.
    .order("is_active", { ascending: true })
    .order("created_at", { ascending: false });

  const dateFormat = new Intl.DateTimeFormat(lang, { dateStyle: "medium" });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t.title} description={canManage ? t.subtitle : t.readOnly} />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-border text-start text-xs text-muted">
              <th className="px-5 py-3 text-start font-medium">{t.name}</th>
              <th className="px-5 py-3 text-start font-medium">{t.status}</th>
              <th className="px-5 py-3 text-start font-medium">{t.joined}</th>
              <th className="px-5 py-3 text-start font-medium">{t.role}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(users ?? []).map((u) => {
              const isMe = u.id === me.id;
              return (
                <tr key={u.id} className="align-middle">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      {u.full_name || <span className="text-muted">{t.noName}</span>}
                      {isMe ? <Badge tone="primary">{t.you}</Badge> : null}
                    </div>
                    <div className="ltr-text text-xs text-muted">{u.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    {u.is_active ? (
                      <Badge tone="success">{t.active}</Badge>
                    ) : (
                      <Badge tone="warning">{t.pending}</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-muted">
                    {dateFormat.format(new Date(u.created_at))}
                  </td>
                  <td className="px-5 py-3">
                    {canManage ? (
                      <UserActions
                        userId={u.id}
                        role={u.role}
                        isActive={u.is_active}
                        dict={{ roles: dict.roles, users: t, errors: dict.errors, common: dict.common }}
                      />
                    ) : (
                      <Badge>{dict.roles[u.role]}</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
            {users?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted">
                  {t.empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

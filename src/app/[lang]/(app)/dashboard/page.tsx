import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleCheck, Clock, ShieldCheck, Users } from "lucide-react";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { format } from "@/i18n/format";
import { can, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: (await getDictionary(lang)).dashboard.title };
}

export default async function DashboardPage({ params }: PageProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, user] = await Promise.all([getDictionary(lang), requireUser(lang)]);
  const t = dict.dashboard;

  // User counts (only for people allowed to see users).
  let counts: { total: number; active: number; pending: number } | null = null;
  if (can(user, "users.view")) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("is_active");
    const rows = data ?? [];
    const active = rows.filter((r) => r.is_active).length;
    counts = { total: rows.length, active, pending: rows.length - active };
  }

  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={format(t.welcome, { name: user.fullName || user.email })} description={dict.app.tagline} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<ShieldCheck />} label={t.yourRole} value={dict.roles[user.role]} />
        {counts ? (
          <>
            <Stat icon={<Users />} label={t.totalUsers} value={counts.total} />
            <Stat icon={<CircleCheck />} label={t.activeUsers} value={counts.active} />
            <Stat
              icon={<Clock />}
              label={t.pendingUsers}
              value={counts.pending}
              highlight={counts.pending > 0}
              action={
                counts.pending > 0 && can(user, "users.manage") ? (
                  <Link href={`/${lang}/users`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    {t.reviewPending}
                    <Arrow className="size-3.5" aria-hidden />
                  </Link>
                ) : null
              }
            />
          </>
        ) : null}
      </div>

      <Card className="mt-6">
        <CardHeader title={t.gettingStarted} description={t.gettingStartedBody} />
        <ol className="divide-y divide-border">
          {[t.stepUsers, t.stepRoles, t.stepModules].map((step, i) => (
            <li key={step} className="flex items-start gap-3 px-5 py-3.5 text-sm">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className={`[&_svg]:size-4.5 ${highlight ? "text-warning" : "text-muted"}`}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </Card>
  );
}

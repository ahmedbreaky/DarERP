import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { requireUser } from "@/lib/auth";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { PasswordForm, ProfileForm } from "./settings-forms";

export async function generateMetadata({ params }: PageProps<"/[lang]/settings">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: (await getDictionary(lang)).settings.title };
}

export default async function SettingsPage({ params }: PageProps<"/[lang]/settings">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, user] = await Promise.all([getDictionary(lang), requireUser(lang)]);
  const t = dict.settings;
  const formDict = { auth: dict.auth, errors: dict.errors, common: dict.common, settings: t };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={t.title} />
      <Card>
        <CardHeader title={t.profileTitle} description={t.profileBody} />
        <ProfileForm fullName={user.fullName} email={user.email} dict={formDict} />
      </Card>
      <Card>
        <CardHeader title={t.passwordTitle} description={t.passwordBody} />
        <PasswordForm dict={formDict} />
      </Card>
    </div>
  );
}

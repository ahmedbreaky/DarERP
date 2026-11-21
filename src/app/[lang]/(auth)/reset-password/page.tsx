import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AuthHeading } from "../auth-heading";
import { ResetForm } from "./reset-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/reset-password">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: (await getDictionary(lang)).auth.resetTitle };
}

/** Opened from the "reset password" email (via /auth/confirm, which signs the user in). */
export default async function ResetPasswordPage({ params }: PageProps<"/[lang]/reset-password">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <AuthHeading title={dict.auth.resetTitle} subtitle={dict.auth.resetSubtitle} />
      <ResetForm lang={lang} auth={dict.auth} errors={dict.errors} pending={dict.common.saving} />
    </>
  );
}

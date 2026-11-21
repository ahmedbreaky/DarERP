import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AuthHeading } from "../auth-heading";
import { ForgotForm } from "./forgot-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/forgot-password">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: (await getDictionary(lang)).auth.forgotTitle };
}

export default async function ForgotPasswordPage({ params }: PageProps<"/[lang]/forgot-password">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <AuthHeading title={dict.auth.forgotTitle} subtitle={dict.auth.forgotSubtitle} />
      <ForgotForm lang={lang} auth={dict.auth} errors={dict.errors} pending={dict.common.loading} />
    </>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AuthHeading } from "../auth-heading";
import { LoginForm } from "./login-form";
import { LinkErrorNotice } from "./link-error-notice";

export async function generateMetadata({ params }: PageProps<"/[lang]/login">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: (await getDictionary(lang)).auth.loginTitle };
}

export default async function LoginPage({ params }: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <AuthHeading title={dict.auth.loginTitle} subtitle={dict.auth.loginSubtitle} />
      <Suspense>
        <LinkErrorNotice message={dict.errors.linkInvalid} />
      </Suspense>
      <LoginForm lang={lang} auth={dict.auth} errors={dict.errors} pending={dict.common.loading} />
    </>
  );
}

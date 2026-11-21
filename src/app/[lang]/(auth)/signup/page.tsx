import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SignupForm } from "./signup-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/signup">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: (await getDictionary(lang)).auth.signupTitle };
}

export default async function SignupPage({ params }: PageProps<"/[lang]/signup">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <SignupForm lang={lang} auth={dict.auth} errors={dict.errors} pending={dict.common.loading} />;
}

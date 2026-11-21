import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { format } from "@/i18n/format";
import { getCurrentUser } from "@/lib/auth";
import { Button, buttonClass } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { logout } from "../actions";

export async function generateMetadata({ params }: PageProps<"/[lang]/pending">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: (await getDictionary(lang)).auth.pendingTitle };
}

/** Signed in, but an admin hasn't approved the account yet. */
export default async function PendingPage({ params }: PageProps<"/[lang]/pending">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-5 text-center">
      <Clock className="mx-auto size-10 text-warning" aria-hidden />
      <h1 className="text-2xl font-semibold tracking-tight">{dict.auth.pendingTitle}</h1>
      <Suspense fallback={<Skeleton className="mx-auto h-16 w-full" />}>
        <PendingDetails lang={lang} dict={dict} />
      </Suspense>
    </div>
  );
}

async function PendingDetails({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);
  if (user.isActive) redirect(`/${lang}/dashboard`);

  return (
    <>
      <p className="text-sm leading-relaxed text-muted">
        {format(dict.auth.pendingBody, { email: user.email })}
      </p>
      <div className="flex justify-center gap-2">
        <a href={`/${lang}/pending`} className={buttonClass("secondary")}>
          {dict.auth.checkAgain}
        </a>
        <form action={logout.bind(null, lang)}>
          <Button type="submit" variant="ghost">
            {dict.nav.signOut}
          </Button>
        </form>
      </div>
    </>
  );
}

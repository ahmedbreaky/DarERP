import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AppShell } from "@/components/shell/app-shell";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { UserMenu } from "@/components/shell/user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Layout for every signed-in page. The frame renders instantly; the parts
 * that depend on who is signed in stream in behind <Suspense>.
 */
export default async function AppLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-4">
      <Link href={`/${lang}/dashboard`} className="px-3 py-1">
        <Logo name={dict.app.name} />
      </Link>
      <Suspense fallback={<NavSkeleton />}>
        <SidebarNav lang={lang} dict={dict} />
      </Suspense>
    </div>
  );

  const topbar = (
    <>
      <LanguageSwitcher locale={lang} label={dict.common.language} ariaLabel={dict.common.languageLabel} />
      <Suspense fallback={<Skeleton className="h-9 w-36" />}>
        <UserMenu lang={lang} dict={dict} />
      </Suspense>
    </>
  );

  return (
    <AppShell
      sidebar={sidebar}
      topbar={topbar}
      labels={{ open: dict.common.openMenu, close: dict.common.closeMenu }}
    >
      {children}
    </AppShell>
  );
}

function NavSkeleton() {
  return (
    <div className="space-y-2 px-3">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

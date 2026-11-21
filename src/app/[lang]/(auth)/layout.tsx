import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Alert } from "@/components/ui/alert";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Layout for sign-in, sign-up and password pages: brand panel + form. */
export default async function AuthLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-fg lg:flex lg:flex-col lg:justify-between">
        <Logo name={dict.app.name} inverted />
        <div className="max-w-md space-y-3">
          <p className="text-3xl leading-snug font-semibold">{dict.app.tagline}</p>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -end-24 -top-24 size-96 rounded-full border-[48px] border-primary-fg/10"
        />
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6">
          <span className="lg:invisible">
            <Logo name={dict.app.name} />
          </span>
          <LanguageSwitcher
            locale={lang}
            label={dict.common.language}
            ariaLabel={dict.common.languageLabel}
          />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 pt-4 pb-16 sm:px-6">
          <div className="w-full max-w-sm">
            {getSupabaseEnv() ? null : (
              <div className="mb-6">
                <Alert tone="error">{dict.errors.notConfigured}</Alert>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

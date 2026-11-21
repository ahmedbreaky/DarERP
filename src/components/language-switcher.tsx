"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { locales, type Locale } from "@/i18n/config";
import { buttonClass } from "./ui/button";

/** Link to the same page in the other language. */
export function LanguageSwitcher({
  locale,
  label,
  ariaLabel,
}: {
  locale: Locale;
  label: string;
  ariaLabel: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const other = locales.find((l) => l !== locale) ?? locale;
  const href = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${other}`);

  return (
    <Link href={href} hrefLang={other} aria-label={ariaLabel} className={buttonClass("ghost", "sm")}>
      <Languages className="size-4" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

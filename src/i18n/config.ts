export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

/** Arabic first: the default when we can't tell what the visitor prefers. */
export const defaultLocale: Locale = "ar";

/** Cookie that remembers the visitor's last chosen language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function hasLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Pick a locale from an Accept-Language header, e.g. "en-US,en;q=0.9,ar;q=0.8". */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) {
    if (hasLocale(lang)) return lang;
  }
  return defaultLocale;
}
